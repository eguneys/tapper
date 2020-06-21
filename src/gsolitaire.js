import { makeOneDeck } from './deck';
import { stackPlate, 
         holePlate, 
         isN, 
         SoliStack,
         SoliHole,
         SoliDrawDeck } from './soliutils';
import SoliDeal from './solideal';

import { pobservable, observable } from './observable';

const pDelay = d => {
  return new Promise(resolve => setTimeout(resolve, d));
};

export default function GSolitaire() {
  

  let stacks = stackPlate.map(_ => observable(new SoliStack()));

  let holes = holePlate.map(_ => observable(new SoliHole()));

  let drawer = observable(new SoliDrawDeck());

  let undoer = this.undoer = observable([]);

  let beginSelection = this.bSelection = observable({});
  let activeSelection = this.aSelection = observable({});

  let persistSelection = this.pSelection = observable({});

  let dealer = new SoliDeal();

  let fxs = {
    'deal': pobservable(),
    'settle': pobservable(),
    'reveal': pobservable(),
    'move': pobservable(),
    'dealdraw': pobservable(),
    'unreveal': pobservable()
  };

  let holeN = this.holeN = n => holes[n];
  let stackN = this.stackN = n => stacks[n];
  let fx = this.fx = name => fxs[name];
  this.drawer = drawer;

  let deck = makeOneDeck();

  this.userActionNewGame = async () => {
    await actionCancel();
    await this.userInit();
  };

  this.userInit = async () => {
    await actionReset();
    await actionDealCards();
  };

  let isRunning;
  const actionCancel = async () => {
    isRunning = false;
    await actionCancelFxs();
    await pDelay(0);
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

    holes.forEach(_ =>
      _.mutate(_ => _.clear()));
  };

  const actionDealCards = async () => {
    deck.shuffle();

    drawer.mutate(_ => _.init(deck.drawRest()));
    dealer.init();

    while (isRunning) {
      let res = dealer.acquireDeal();

      if (res === null) {
        break;
      }

      await actionDealCard(res);
    }
  };

  const actionDealCard = async (oDeal) => {
    let { i, hidden } = oDeal;

    let card = drawer.mutate(_ => _.dealOne1()),
        cards = [card];

    await fx('deal').begin({
      stackN: i,
      cards,
      hidden
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
   * Deal Draw
   */

  const actionDealDraw = async () => {
    let card = effectDealDraw();

    await fx('dealdraw').begin(card);

    drawer.mutate(_ => _.dealOne2(card));

    effectUndoPush(async () => {
      await actionUndoDealDraw(card);
    });
  };

  const effectDrawerDraw = () => {
    return drawer.mutate(_ => _.draw1());
  };

  const effectDealDraw = () => {
    return drawer.mutate(_ => _.dealOne1());
  };

  const effectDrawerCommitDraw = () => {
    drawer.mutate(_ => _.drawCommit1());
  };

  const effectDrawerUndoDraw = (card) => {
    drawer.mutate(_ => _.undoDraw(card));
  };

  /*
   * Selection, Persist Select
   */

  const effectActiveSelectHole = (holeN, cards) => {
    activeSelection.mutate(_ => {
      _.holeN = holeN;
      _.cards = cards;
    });    
  };

  const effectActiveSelectDraw = (cards) => {
    activeSelection.mutate(_ => {
      _.drawN = true;
      _.cards = cards;
    });    
  };

  const effectActiveSelectStack = (stackN, cards) => {
    activeSelection.mutate(_ => {
      _.stackN = stackN;
      _.cards = cards;
    });    
  };

  const effectActiveDeselect = () => {
    activeSelection.mutate(_ => {
      _.active = false;
    });
  };

  const effectActiveSelect = (epos, decay) => {
    activeSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.holeN = false;
      _.drawN = false;
      _.hasMoved = false;
      _.epos = epos;
      _.decay = decay;
    });
  };

  const effectBeginSelect = (cards) => {
    beginSelection.mutate(_ => _.cards = cards);
  };

  const effectPersistSelectEnd = () => {
    // don't clear fields here to allow unhighlighting old values
    persistSelection.mutate(_ => {
      _.active = false;
      // _.stackN = false;
      // _.cardN = false;
      // _.holeN = false;
      // _.drawN = false;
    });
  };

  const effectPersistSelectStack = (_stackN, cards) => {
    let cardN = stackN(_stackN)
        .apply(_ => 
          _.front.indexOf(cards[0]));

    // TODO 
    persistSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.cardN = false;
      _.holeN = false;
      _.drawN = false;

      _.stackN = _stackN;
      _.cardN = cardN;
      _.cards = cards;
    });
  };

  const effectPersistSelectHole = (_holeN, cards) => {
    persistSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.cardN = false;
      _.holeN = false;
      _.drawN = false;

      _.holeN = _holeN;
      _.cards = cards;
    });
  };

  const effectPersistSelectDraw = (cards) => {
    persistSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.cardN = false;
      _.holeN = false;
      _.drawN = false;

      _.drawN = true;
      _.cards = cards;
    });
  };

  /*
   * Stack, Hole Effects
   */

  const effectHoleAdd = (_holeN, card) => {
    return holeN(_holeN)
      .mutate(_ => _.add(card));
  };

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

  const effectHoleRemoveCancel = (_holeN, card) => {
    return holeN(_holeN).mutate(_ => {
      return _.add(card);
    });
  };

  const askHoleRemove = _holeN => {
    return holeN(_holeN).apply(_ => {
      return _.canRemove();
    });
  };

  const effectHoleRemove = _holeN => {
    return holeN(_holeN).mutate(_ => {
      return _.remove();
    });
  };


  /*
   * Undo Effect
   */
  const effectUndoPush = undo => {
    undoer.mutate(_ => _.push(undo));
  };

  /*
   * Stack Hole Permissions
   */

  const canSettleHole = (dstHoleN, cards) => {
    return holeN(dstHoleN)
      .apply(_ => _.canAdd(cards));
  };

  const canSettleStack = (dstStackN, cards) => {
    return stackN(dstStackN)
      .apply(_ => _.canAdd(cards));
  };


  /*
   * Undo Actions
   */

  let userUndosQueue = serialPromise();

  let i = 0;
  const actionUndos = async () => {
    let canUndo = undoer.apply(_ => _.length > 0);

    if (!canUndo) {
      return;
    }

    let undoAction = undoer.mutate(_ => _.pop());

    await undoAction();
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

  const actionUndoStackSrcDraw = async (dstStackN) => {
    let card = effectStackCutLast(dstStackN);

    effectDrawerUndoDraw(card);
  };

  const actionUndoHoleSrcDraw = async (dstHoleN, card) => {

    effectHoleRemove(dstHoleN);

    await fx('move').begin({
      srcHoleN: dstHoleN,
      dstDrawN: true,
      cards: [card]
    });

    effectDrawerUndoDraw(card);    
  };

  const actionUndoStackSrcHole = async (holeN, dstStackN, cards) => {
    effectStackCutLastCards(dstStackN, cards);

    await fx('move').begin({
      srcStackN: dstStackN,
      dstHoleN: holeN,
      cards
    });

    effectHoleRemoveCancel(holeN, cards[0]);
  };

  const actionUndoHole = async (srcStackN, holeN, cards, revealCard) => {

    if (revealCard) {

      stackN(srcStackN)
        .mutate(_ => 
          _.unreveal1(revealCard));

      await fx('unreveal').begin({
        stackN: srcStackN,
        card: revealCard
      });

      stackN(srcStackN)
        .mutate(_ => _.unreveal2(revealCard));
    }    

    effectHoleRemove(holeN);

    await fx('move').begin({
      srcHoleN: holeN,
      dstStackN: srcStackN,
      cards
    });

    effectStackAdd1(srcStackN, cards);
  };

  const actionUndoDealDraw = async (card) => {
    drawer.mutate(_ => _.undealOne(card));
  };

  const actionUndoShuffleDraw = async () => {
    drawer.mutate(_ => _.undoShuffle());
  };


  /*
   *  Undo Action
   */

  const actionUndo = () => {
    userUndosQueue(actionUndos);    
  };



  /*
   * Settle Stack
   */

  const actionSettleHole = async (srcStackN, dstHoleN, cards) => {
    await fx('settle').begin({
      holeN: dstHoleN,
      cards
    });

    effectHoleAdd(dstHoleN, cards[0]);

    let revealCard = await actionRevealStack(srcStackN);

    effectUndoPush(async () => {
      await actionUndoHole(srcStackN, dstHoleN, cards, revealCard);
    });
  };

  const actionSettleStack = async (srcStackN, dstStackN, cards) => {

    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });
    
    effectStackAdd1(dstStackN, cards);

    let revealCard = await actionRevealStack(srcStackN);

    effectUndoPush(async () => {
      await actionUndoStackStack(srcStackN, dstStackN, cards, revealCard);
    });
  };

  const actionSettleStackCancel = async (stackN, cards, hasMoved) => {

    await fx('settle').begin({
      stackN,
      cards
    });

    effectStackAdd1(stackN, cards);

    // call this before persist select stack because of highlight
    effectStackCutInProgressCommit(stackN);

    if (!hasMoved) {
      effectPersistSelectStack(stackN, cards);
    }
  };

  const actionRevealStack = async (_stackN) => {
    let canReveal = stackN(_stackN).apply(_ => _.canReveal());

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
   * Settle Draw
   */

  const actionSettleHoleSrcDraw = async (dstHoleN, cards) => {
    
    let card = cards[0];

    await fx('settle').begin({
      holeN: dstHoleN,
      cards
    });

    effectDrawerCommitDraw();

    effectHoleAdd(dstHoleN, card);

    effectUndoPush(async () => {
      await actionUndoHoleSrcDraw(dstHoleN, card);
    });
  };

  const actionSettleStackSrcDraw = async (dstStackN, cards) => {

    let card = cards[0];

    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });

    effectDrawerCommitDraw();

    effectStackAdd1(dstStackN, cards);

    effectUndoPush(async () => {
      await actionUndoStackSrcDraw(dstStackN, card);
    });
  };

  const actionSettleDrawCancel = async (cards, hasMoved) => {
    let card = cards[0];
    
    await fx('settle').begin({
      drawN: true,
      cards
    });

    drawer.mutate(_ => _.drawCancel1(card));

    if (!hasMoved) {
      effectPersistSelectDraw(cards);
    }
  };

  /*
   * Settle Src Hole
   */

  const actionSettleStackSrcHole = async (holeN, dstStackN, cards) => {
    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });

    effectStackAdd1(dstStackN, cards);

    effectUndoPush(async () => {
      actionUndoStackSrcHole(holeN, dstStackN, cards);
    });
  };

  const actionSettleHoleCancel = async (holeN, cards, hasMoved) => {

    await fx('settle').begin({
      holeN,
      cards
    });

    effectHoleRemoveCancel(holeN, cards[0]);

    if (!hasMoved) {
      effectPersistSelectHole(holeN, cards);
    }
  };
  

  /*
   *  Shuffle Draw
   */

  const actionShuffleDraw = async () => {
    let cards = drawer.mutate(_ => _.shuffle1());

    drawer.mutate(_ => _.shuffle2(cards));

    effectUndoPush(async () => {
      await actionUndoShuffleDraw();
    });
  };

  /*
   * Select/Drop Draw
   */

  const actionSelectDraw = async orig => {
    let card = effectDrawerDraw();

    effectActiveSelectDraw([card]);
    effectPersistSelectEnd();
    effectBeginSelect([card]);
  };

  const actionDragDrawDrop = async dest => {

    let { stackN,
          cards,
          hasMoved } = activeSelection.apply(fId);
    
    let { stackN: dstStackN,
          holeN: dstHoleN } = dest;

    if (isN(dstStackN) && 
        canSettleStack(dstStackN, cards)) {
      await actionSettleStackSrcDraw(dstStackN, cards);
    } else if (isN(dstHoleN) && 
               canSettleHole(dstHoleN, cards)) {
      await actionSettleHoleSrcDraw(dstHoleN, cards);
    } else {
      await actionSettleDrawCancel(cards, hasMoved);
    }
  };

  /* 
   * Select/Drop Stack
   */

  const actionSelectStack = orig => {
    let { stackN, cardN } = orig;
    let cards = effectStackCutInProgress(stackN, cardN);

    effectActiveSelectStack(stackN, cards);
    effectPersistSelectEnd();
    effectBeginSelect(cards);
  };


  const actionDragStackDrop = async (dest) => {

    let { stackN, cards, hasMoved } = activeSelection.apply(fId);

    let { stackN: dstStackN,
          holeN: dstHoleN } = dest;

    if (isN(dstHoleN) && canSettleHole(dstHoleN, cards)) {
      await actionSettleHole(stackN, dstHoleN, cards);
      effectStackCutInProgressCommit(stackN);

    } else if (isN(dstStackN) &&
               dstStackN !== stackN && 
               canSettleStack(dstStackN, cards)) {
      await actionSettleStack(stackN, dstStackN, cards);
      effectStackCutInProgressCommit(stackN);
    } else {
      await actionSettleStackCancel(stackN, cards, hasMoved);
    }
  };

  /*
   * Select/Drop Hole
   */

  const actionSelectHole = async (orig) => {
    let { holeN } = orig;

    if (!askHoleRemove(holeN)) {
      return;
    }

    let card = effectHoleRemove(holeN),
        cards = [card];

    effectActiveSelectHole(holeN, cards);
    effectPersistSelectEnd();
    effectBeginSelect(cards);
  };

  const actionDragHoleDrop = async (dest) => {

    let { holeN,
          cards,
          hasMoved } = activeSelection.apply(fId);

    let { stackN: dstStackN } = dest;

    if (isN(dstStackN) && canSettleStack(dstStackN, cards)) {
      return await actionSettleStackSrcHole(holeN, dstStackN, cards);
    } else {
      return await actionSettleHoleCancel(holeN, cards, hasMoved);
    }    
  };

  const actionDragStart = async (orig) => {
    let { epos, decay } = orig;
    let { stackN, holeN, drawN } = orig;

    let { active, 
          activeEnding 
        } = activeSelection.apply(fId);

    if (active || activeEnding) {
      return;
    }
    effectActiveSelect(epos, decay);

    if (isN(stackN)) {
      await actionSelectStack(orig);
    } else if (drawN) {
      await actionSelectDraw(orig);
    } else if (isN(holeN)) {
      await actionSelectHole(orig);
    }
  };

  const actionDragMove = async (epos) => {

    if (!activeSelection.apply(_ => _.active)) {
      return;
    }

    activeSelection.mutate(_ => {
      _.epos = epos;
      _.hasMoved = true;
    });
  };

  const fId = _ => _;

  const actionDragEnd = async (dest) => {
    let { epos, decay } = dest;

    let { 
      activeEnding,
      active,
      stackN, 
      drawN,
      holeN } = activeSelection.apply(fId);

    if (!active || activeEnding) {
      return;
    }
    activeSelection.mutate(_ => {
      _.activeEnding = true;
    });

    if (isN(stackN)) {
      await actionDragStackDrop(dest);
    } else if (isN(drawN)) {
      await actionDragDrawDrop(dest);
    } else if (isN(holeN)) {
      await actionDragHoleDrop(dest);
    }

    activeSelection.mutate(_ => {
      _.activeEnding = false;
    });
    effectActiveDeselect();
    effectPersistSelectEnd();
  };

  /* 
   * Queue User Actions
   */

  function serialPromise() {
    let lastPromise = Promise.resolve();
    return function(fn) {
      lastPromise = lastPromise.then(fn);
      return lastPromise;
    };
  }

  let userActionsQueue = serialPromise();

  this.userActionDealDraw = async () => {
    await userActionsQueue(actionDealDraw);
  };

  this.userActionDragStart = async (orig) => {
    await actionDragStart(orig);
  };

  this.userActionDragMove = async (epos) => {
    await actionDragMove(epos);
  };

  this.userActionDragEnd = async (dest) => {
    await actionDragEnd(dest);
  };

  this.userActionShuffle = async () => {
    await actionShuffleDraw();
  };

  this.userActionUndo = async () => {
    await actionUndo();
  };
  
}
