import { serialPromise } from './util2';

import * as ou from './optionutils';

import { oneSuitDeckRaw,
         twoSuitDeckRaw,
         makeTwoDeck } from './deck';

import { pobservable,
         observable } from './observable';
import { fId, 
         fConstant,
         fNull,
         fBoolean } from './futils';
import { pDelay } from './util';

import { stackPlate, 
         isN,
         canEndStack,
         canAddToStack,
         canMoveStackWithCardN as _canMoveStackWithCardN,
         orderedLowestCardN,
         SpiStack,
         SpiDrawDeck } from './spiderutils';

import * as su from './spiderutils';

import SpiDeal from './spideal';

export default function GSpider(cardGame) {

  let stacks = stackPlate.map(_ => 
    observable(new SpiStack()));

  let drawer = observable(new SpiDrawDeck());

  let oBeginSelection = this.oBSelection = observable({});
  let oActiveSelection = this.oASelection = observable({});

  let oPersistSelection = this.oPSelection = observable({});

  let oFailSelection = this.oFailSelection = observable({});

  let oSaveState = this.oSaveState = observable(null);

  let oGameReset = this.oGameReset = observable(null);
  let oGameOver = this.oGameOver = observable(null);
  let oShowTutorial = this.oShowTutorial = observable(null);


  let oEmptyStacks = this.oEmptyStacks = observable([]);

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

  let deckOptions = {
    [ou.fourSuits]: makeTwoDeck(),
    [ou.twoSuits]: makeTwoDeck(twoSuitDeckRaw()),
    [ou.oneSuit]: makeTwoDeck(oneSuitDeckRaw())
  };

  let deck;

  let dealer = new SpiDeal();

  let undoer = new Undoer();

  this.userActionNewGame = async (options) => {
    await this.userInit({options});
    await actionSaveState();
  };

  this.userInit = async (data) => {
    await actionCancel();
    await actionReset(data.options);

    if (data.play) {
      await actionResume(data.play);
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

  const actionReset = (options) => {
    isRunning = true;

    undoer.clear();

    stacks.forEach(_ =>
      _.mutate(_ => _.clear()));

    deck = deckOptions[options.nbSuits];


    oGameReset.set(fId);
    oGameOver.set(fNull);
  };

  const actionResume = async play => {
    let { eStacks,
          eDrawer } = readState(play);

    eStacks.forEach((eStack, i) => {
      stackN(i).mutate(_ => _.read(eStack));
    });

    drawer.mutate(_ => _.read(eDrawer));
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
   * Action Game Over
   */
  const actionCheckGameOver = async () => {
    let allDone = stacks
        .map(_ => 
          _.apply(_ => 
            _.isEmpty()))
        .reduce((acc, value) => acc && value, true);

    if (allDone) {
      actionGameOver();
    }
  };

  const actionGameOver = async () => {
    let gameOverData = {};
    oGameOver.set(fConstant(gameOverData));
  };

  /*
   * Action Save State
   */
  const actionPushUndoAndSaveState = undo => {
    undoer.effectUndoPush(undo);

    actionSaveState();
  };

  const actionSaveState = () => {
    let state = writeState({
      stacks: stacks
        .map(_ => _.apply(fId)),
      drawer: drawer.apply(fId)
    });
    effectSaveState(state);
  };

  const effectSaveState = (state) => {
    oSaveState.set(_ => state);
  };

  /*
   *  Show Tutorial
   */
  /*
   * Show Tutorial
   */
  const actionMaybeShowTutorial = () => {
    let showTutorial = cardGame
        .oOptions
        .showTutorial
        .spider
        .apply(fId);

    if (showTutorial) {
      effectShowTutorial();
    }
  };

  const effectShowTutorial = () => {
    oShowTutorial.set(fId);
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


    // TODO maybe move to own function
    oFailSelection.mutate(_ => {
      _.active = false;
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

  const effectFailSelection = (stackN, cardN) => {
    oFailSelection.mutate(_ => {
      _.active = true;
      _.stackN = stackN;
      _.cardN = cardN;
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

  const effectEmptyStacks = () => {
    let emptyStacks = stacks
        .map((_, n) => ({ n, _ }))
        .filter(({_, n}) => 
          _.apply(_ => _.isEmpty()))
        .map(_ => _.n);

    oEmptyStacks.set(fConstant(emptyStacks));
  };

  /*
   * Stack Permissions
   */
  const canSettleStack = (dstStackN, cards) => {
    return stackN(dstStackN)
      .apply(_ => canAddToStack(_, cards));
  };

  const canMoveStackWithCardN = (srcStackN, cardN) => {
    return stackN(srcStackN)
      .apply(_ => _canMoveStackWithCardN(_, cardN));
  };

  const canDealBecauseEmptyColumn = () => {
    let emptyStack = stacks.find(_ => _.apply(_ => _.isEmpty()));
    return !emptyStack;
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

    let endStack = await actionEndStack(dstStackN);

    await actionCheckGameOver();

    actionPushUndoAndSaveState(async () => {
      await actionUndoStackStack(srcStackN, 
                                 dstStackN,
                                 cards,
                                 revealCard,
                                 endStack);
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

  const actionEndStack = async (_stackN) => {
    
    let canEnd = stackN(_stackN)
        .apply(_ => canEndStack(_));

    if (!canEnd) {
      return null;
    }

    let cards = stackN(_stackN)
        .mutate(_ => _.cutRun());

    return cards;
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
        actionMaybeShowTutorial();
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

  const actionUndoStackStack = async (srcStackN, dstStackN, cards, revealCard, endCards) => {

    if (revealCard) {

      stackN(srcStackN).mutate(_ => _.unreveal1(revealCard));

      await fx('unreveal').begin({
        stackN: srcStackN,
        card: revealCard
      });

      stackN(srcStackN).mutate(_ => _.unreveal2(revealCard));
    }

    if (endCards) {
      stackN(dstStackN)
        .mutate(_ => _.addRun(endCards));
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

    let endStack = await actionEndStack(dstStackN);

    await actionCheckGameOver();

    actionPushUndoAndSaveState(async () => {
      await actionUndoStackStack(srcStackN, 
                                 dstStackN,
                                 cards,
                                 revealCard,
                                 endStack);
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
    let { stackN: _stackN, cardN } = orig;

    let persistResult = 
    await actionPersistSelectStack(_stackN, cardN);

    if (persistResult) {
      return;
    }

    // select empty placeholder
    if (!isN(cardN)) {
      return;
    }

    if (!canMoveStackWithCardN(_stackN, cardN)) {
      let lowestCardN = stackN(_stackN).apply(_ => orderedLowestCardN(_));
      effectFailSelection(_stackN, lowestCardN);
      return;
    }

    let cards = effectStackCutInProgress(_stackN, cardN);

    effectActiveSelectStack(_stackN, cards);
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

    if (!canDealBecauseEmptyColumn()) {
      effectEmptyStacks();
      return;
    }

    dealing = true;

    for (let i = 0; i < stackPlate.length; i++) {
      await actionDealCard({
        i: stackPlate[i],
        hidden: false
      }, true);
    }

    dealing = false;

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

const writeState = ({ stacks, drawer }) => {
  let eStacks = stacks.map(_ => _.write());
  let eDrawer = drawer.write();

  return `${eStacks.join('!')} ${eDrawer}`;
};

const readState = (play) => {

  let [eStacks, eDrawer] = play.split(' ');

  eStacks = eStacks.split('!');

  return {
    eStacks,
    eDrawer
  };
};

function Undoer() {

  let undoer = observable([]);

  this.clear = () => undoer.set(_ => []);

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
