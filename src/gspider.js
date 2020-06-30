import { serialPromise } from './util2';

import { makeTwoDeck } from './deck';

import { pobservable,
         observable } from './observable';
import { fId, 
         fConstant,
         fNull,
         fBoolean } from './futils';
import { pDelay } from './util';

import { stackPlate, 
         isN,
         canAddToStack,
         SpiStack,
         SpiDrawDeck } from './spiderutils';
import SpiDeal from './spideal';

export default function GSpider() {

  let stacks = stackPlate.map(_ => 
    observable(new SpiStack()));

  let drawer = observable(new SpiDrawDeck());

  let oBeginSelection = this.oBSelection = observable({});
  let oActiveSelection = this.oASelection = observable({});

  let oPersistSelection = this.oPSelection = observable({});

  let fxs = {
    'move': pobservable(),
    'deal': pobservable(),
    'undeal': pobservable(),
    'settle': pobservable(),
    'reveal': pobservable(),
    'unreveal': pobservable()
  };
  
  let stackN = this.stackN = n => stacks[n];
  let fx = this.fx = name => fxs[name];
  this.drawer = drawer;

  let deck = makeTwoDeck();
  let dealer = new SpiDeal();

  let undoer = new Undoer();

  this.userInit = async (data) => {
    await actionCancel();
    await actionReset(data.options);

    if (data.play) {
      // await actionResume(data.play);
    } else {
      await actionDealCards();
    }
  };

  let isRunning;
  const actionCancel = async () => {
    isRunning = false;
    // await actionCancelFxs();
    // wait for deal/holl animations to cancel
    await pDelay(300);
  };

  const actionCancelFxs = async () => {
    for (let key in fxs) {
      fx(key).reject("Action cancel Fxs");
    }
  };

  const actionReset = () => {
    isRunning = true;
    stacks.forEach(_ =>
      _.mutate(_ => _.clear()));
  };
  
  let dealing;
  const actionDealCards = async () => {
    deck.shuffle();

    drawer.mutate(_ => _.init(deck.drawRest()));
    dealer.init();
    dealing = true;
    while (isRunning) {
      let res = dealer.acquireDeal();

      if (res === null) {
        break;
      }

      await actionDealCard(res);      
    }
    dealing = false;
  };

  const actionDealCard = async (oDeal, slow) => {
    let { i, hidden } = oDeal;

    let cards = drawer
        .mutate(_ => _.dealOnlyOne());

    await fx('deal').begin({
      stackN: i,
      cards,
      hidden,
      slow
    });

    if (hidden) {
      stackN(i).mutate(_ => {
        _.hide1(cards);
      });
    } else {
      stackN(i).mutate(_ => {
        _.add1(cards);
      });      
    }
  };


  /*
   * Action Save State
   */
  const actionPushUndoAndSaveState = undo => {
    undoer.effectUndoPush(undo);

    actionSaveState();
  };

  const actionSaveState = () => {
    //let state = writeState();
    //effectSaveState(state);    
  };

  const effectSaveState = (state) => {
    // oSaveState.set(_ => state);
  };

  /*
   * Selection
   */

  const effectActiveSelectStack = (stackN, cards) => {
    oActiveSelection.mutate(_ => {
      _.stackN = stackN;
      _.cards = cards;
    });    
  };

  const effectActiveDeselect = () => {
    oActiveSelection.mutate(_ => {
      _.active = false;
    });
  };

  const effectActiveSelect = (epos, decay) => {
    oActiveSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.hasMoved = false;
      _.epos = epos;
      _.decay = decay;
    });
  };

  const effectBeginSelect = (cards) => {
    oBeginSelection.mutate(_ => _.cards = cards);
  };

  const effectPersistSelectEnd = () => {
    // TODO probably not needed
    // don't clear fields here to allow unhighlighting old values
    oPersistSelection.mutate(_ => {
      _.active = false;
      // _.stackN = false;
      // _.cardN = false;
    });
  };

  const effectPersistSelectStack = (_stackN, cards) => {
    let cardN = stackN(_stackN)
        .apply(_ => 
          _.front.indexOf(cards[0]));

    // TODO 
    oPersistSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.cardN = false;

      _.stackN = _stackN;
      _.cardN = cardN;
      _.cards = cards;
    });
  };

  /*
   *  Effect Stack Add Cut
   */
  const effectStackAdd1 = (_stackN, cards) => {
    return stackN(_stackN)
      .mutate(_ => _.add1(cards));
  };

  const effectStackCut1 = (_stackN, cardN) => {
    return stackN(_stackN)
      .mutate(_ => _.cut1(cardN));
  };

  const effectStackCutInProgress = (_stackN, cardN) => {
    return stackN(_stackN)
      .mutate(_ => _.cutInProgress(cardN));
  };

  const effectStackCutInProgressCommit = (_stackN) => {
    return stackN(_stackN)
      .mutate(_ => _.cutInProgressCommit());
  };

  const effectStackCutLast = (_stackN) => {
    return stackN(_stackN)
      .mutate(_ => _.cutLast());
  };

  const effectStackCutLastCards = (_stackN, cards) => {
    return stackN(_stackN)
      .mutate(_ => cards.forEach(__ => _.cutLast()));
  };

  /*
   * Stack Permissions
   */
  const canSettleStack = (dstStackN, cards) => {
    return stackN(dstStackN)
      .apply(_ => canAddToStack(_, cards));
  };

  /*
   * Action Settle Stack
   */
  const actionSettleStack = async (srcStackN, dstStackN, cards) => {

    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });
    
    effectStackAdd1(dstStackN, cards);

    let revealCard = await actionRevealStack(srcStackN);

    actionPushUndoAndSaveState(async () => {
      await actionUndoStackStack(srcStackN, dstStackN, cards, revealCard);
    });
  };

  const actionSettleStackCancel = async (stackN, cards, hasMoved) => {

    await fx('settle').begin({
      stackN,
      cards
    });

    effectStackAdd1(stackN, cards);

    // call this before persist select stack
    // because of highlight
    effectStackCutInProgressCommit(stackN);

    if (!hasMoved) {
      effectPersistSelectStack(stackN, cards);
    }
  };

  const actionRevealStack = async (_stackN) => {
    let canReveal = stackN(_stackN)
        .apply(_ => _.canReveal());

    if (!canReveal) {
      return null;
    }

    let last = stackN(_stackN)
        .mutate(_ => _.reveal1());

    await fx('reveal').begin({
      stackN: _stackN,
      card: last
    });

    effectStackAdd1(_stackN, [last]);

    return last;
  };


  /*
   * Action Drop Stack
   */
  const actionDragStackDrop = async (dest) => {

    let { stackN, cards, hasMoved } = 
        oActiveSelection.apply(fId);

    let { stackN: dstStackN } = dest;

    if (isN(dstStackN) &&
        dstStackN !== stackN && 
        canSettleStack(dstStackN, cards)) {

      await actionSettleStack(stackN, dstStackN, cards);
      effectStackCutInProgressCommit(stackN);
    } else {
      if (isN(dstStackN)) {
        // actionMaybeShowTutorial();
      }
      await actionSettleStackCancel(stackN, cards, hasMoved);
    }
  };

  /*
   *  Undo Actions
   */

  const actionUndoDealDraw = async () => {
    for (let i = stackPlate.length - 1; i >= 0; i--) {
      let card = stackN(i)
          .mutate(_ => _.cutLast());
      
      await fx('undeal').begin({
        stackN: i,
        card
      });

      drawer
        .mutate(_ => _.undealOne(card));
    }
  };

  const actionUndoStackStack = async (srcStackN, dstStackN, cards, revealCard) => {

    if (revealCard) {

      stackN(srcStackN).mutate(_ => _.unreveal1(revealCard));

      await fx('unreveal').begin({
        stackN: srcStackN,
        card: revealCard
      });

      stackN(srcStackN).mutate(_ => _.unreveal2(revealCard));
    }

    effectStackCutLastCards(dstStackN, cards);

    await fx('move').begin({
          srcStackN: dstStackN,
          dstStackN: srcStackN,
          cards
        });


    effectStackAdd1(srcStackN, cards);
  };

  /*
   * Action Move Cards
   */

  const actionMoveCardsStackStack = async (srcStackN, dstStackN, cardN) => {

    let cards = effectStackCut1(srcStackN, cardN);

    let pReveal = actionRevealStack(srcStackN),
        pMove = fx('move').begin({
          srcStackN,
          dstStackN,
          cards
        });

    let revealCard = await pReveal;
    await pMove;

    effectStackAdd1(dstStackN, cards);

    actionPushUndoAndSaveState(async () => {
      await actionUndoStackStack(srcStackN, dstStackN, cards, revealCard);
    });
  };

  /*
   * Action Persist Select
   */
  const actionPersistSelectStack = async (stackN, cardN) => {
    let persistSelected = oPersistSelection
        .apply(_ => _.active);

    if (persistSelected) {
      let { stackN: persistStackN,
            cardN,
            cards } = oPersistSelection
          .apply(_ => _);

      if (isN(persistStackN) && 
          persistStackN !== stackN &&
          canSettleStack(stackN, cards)) {

        effectPersistSelectEnd();
        
        await actionMoveCardsStackStack(persistStackN, stackN, cardN);
        return true;
      }
    }
    return false;
  };

  /*
   * Action Select Stack
   */

  const actionSelectStack = async orig => {
    let { stackN, cardN } = orig;

    let persistResult = 
    await actionPersistSelectStack(stackN, cardN);

    if (persistResult) {
      return;
    }

    // select empty placeholder
    if (!isN(cardN)) {
      return;
    }

    let cards = effectStackCutInProgress(stackN, cardN);

    effectActiveSelectStack(stackN, cards);
    effectPersistSelectEnd();
    effectBeginSelect(cards);
  };


  /*
   * Action Deal Draw
   */

  const actionDealDraw = async () => {
    if (dealing) {
      return;
    }

    for (let i = 0; i < stackPlate.length; i++) {
      await actionDealCard({
        i: stackPlate[i],
        hidden: false
      }, true);
    }

    actionPushUndoAndSaveState(async () => {
      await actionUndoDealDraw();
    });
  };

    /*
   * Action Drag Start
   */
  const actionDragStart = async (orig) => {
    let { epos, decay } = orig;
    let { stackN } = orig;

    let { active, 
          activeEnding 
        } = oActiveSelection.apply(fId);

    if (active || activeEnding) {
      return;
    }
    effectActiveSelect(epos, decay);

    if (isN(stackN)) {
      await actionSelectStack(orig);
    }
  };

  /*
   * Action Drag Move
   */
  const actionDragMove = async (epos) => {

    if (!oActiveSelection.apply(_ => _.active)) {
      return;
    }

    oActiveSelection.mutate(_ => {
      _.epos = epos;
      _.hasMoved = true;
    });
  };
  

  /*
   * Action Drag End
   */
  const actionDragEnd = async (dest) => {
    let { epos, decay } = dest;

    let { 
      activeEnding,
      active,
      stackN } = oActiveSelection.apply(fId);

    if (!active || activeEnding) {
      return;
    }
    oActiveSelection.mutate(_ => {
      _.activeEnding = true;
    });

    if (isN(stackN)) {
      await actionDragStackDrop(dest);
    } else {
      effectPersistSelectEnd();
    }

    oActiveSelection.mutate(_ => {
      _.activeEnding = false;
    });
    effectActiveDeselect();
  };


  const whilePlaying = fn => {
    return async (...args) => {
      //let gameOver = oGameOver.apply(fBoolean);
      let gameOver = false;
      if (gameOver) {
        return;
      }
      await fn(...args);
    };
  };

  let userActionsQueue = serialPromise();

  this.userActionDealDraw = whilePlaying(async () => {
    await userActionsQueue(actionDealDraw);
  });

  this.userActionDragStart = whilePlaying(async (orig) => {
    await actionDragStart(orig);
  });
  
  this.userActionDragMove = whilePlaying(async (epos) => {
    await actionDragMove(epos);
  });

  this.userActionDragEnd = whilePlaying(async (dest) => {
    await actionDragEnd(dest);
  });

  this.userActionUndo = whilePlaying(async () => {
    await userActionsQueue(undoer.actionUndos);
  });
}

function Undoer() {

  let undoer = observable([]);

  this.effectUndoPush = undo => {
    undoer.mutate(_ => _.push(undo));
  };

  this.actionUndos = async () => {
    let canUndo = undoer.apply(_ => _.length > 0);

    if (!canUndo) {
      return;
    }

    let undoAction = undoer.mutate(_ => _.pop());

    await undoAction();
  };
}
