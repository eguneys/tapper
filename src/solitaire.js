import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';
import SoliDeal from './solideal';

import { pobservable, observable } from './observable';

const pDelay = d => {
  return new Promise(resolve => setTimeout(resolve, d));
};

export default function Solitaire() {

  let stacks = [
    observable(new SoliStack()),
    observable(new SoliStack()),
    observable(new SoliStack()),
    observable(new SoliStack()),
    observable(new SoliStack()),
    observable(new SoliStack()),
    observable(new SoliStack())
  ];

  let holes = [
    observable(new SoliHole()),
    observable(new SoliHole()),
    observable(new SoliHole()),
    observable(new SoliHole())
  ];

  let undoer = this.undoer = observable([]);

  let drawer = this.drawer = observable(new SoliDrawDeck());

  let beginSelection = this.bSelection = observable({});
  let activeSelection = this.aSelection = observable({});

  let persistSelection = this.pSelection = observable({});

  let observeUserSelectStack = pobservable(),
      observeUserEndsSelect = pobservable();

  let observeUserDealDraw = pobservable(),
      observeUserSelectDraw = pobservable();

  let observeUserSelectHole = pobservable();

  let observeUserShuffleDraw = pobservable();

  let observeUserDoubleTapStack = pobservable();

  let userObserves = [
    observeUserSelectStack,
    observeUserEndsSelect,
    observeUserDealDraw,
    observeUserSelectDraw,
    observeUserSelectHole,
    observeUserShuffleDraw,
    observeUserDoubleTapStack
  ];

  let observeHackDoubleTapSelectInfo = pobservable();

  let fxs = {
    'deal': pobservable(),
    'settle': pobservable(),
    'reveal': pobservable(),
    'move': pobservable(),
    'dealdraw': pobservable(),
    'unreveal': pobservable()
  };

  let dealer = new SoliDeal();

  let holeN = this.holeN = n => holes[n];
  let stackN = this.stackN = n => stacks[n];
  let fx = this.fx = name => fxs[name];

  let deck = makeOneDeck();

  let running;

  this.userActionDoubleTapStack = async () => {
    observeUserDoubleTapStack.resolve();
  };

  this.userActionShuffle = async () => {
    observeUserShuffleDraw.resolve();
  };

  this.userActionUndo = async () => {
    actionUndosQueue();
  };

  this.userActionNewGame = async () => {
    await this.remove();
    this.init();
  };

  this.userActionDealDraw = () => {
    observeUserDealDraw.resolve();
  };

  this.userActionSelectDraw = (epos, decay) => {
    observeUserSelectDraw.resolve();
    effectActiveSelect(epos, decay);
  };

  this.userActionSelectStack = (stackN, cardN, epos, decay) => {
    observeUserSelectStack.resolve({
      stackN,
      cardN
    });

    if (epos) {
      effectActiveSelect(epos, decay);
    }
  };

  this.userActionSelectHole = (holeN, epos, decay) => {
    observeUserSelectHole.resolve({
      holeN
    });
    effectActiveSelect(epos, decay);
  };

  this.userActionMove = (epos) => {
    activeSelection.mutate(_ => {
      _.epos = epos;
      _.hasMoved = true;
    });
  };


  this.userActionEndSelectStack = (stackN) => {
    activeSelection.mutate(_ => {
      _.stackN = stackN;
    });
  };

  this.userActionEndSelectHole = (holeN) => {
    activeSelection.mutate(_ => {
      _.holeN = holeN;
    });
  };

  const effectActiveSelect = (epos, decay) => {
    activeSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.holeN = false;
      _.hasMoved = false;
      _.epos = epos;
      _.decay = decay;
    });
  };

  const effectBeginSelect = (cards) => {
    beginSelection.mutate(_ => _.cards = cards);
  };

  this.userActionEndTap = () => {
    observeUserEndsSelect.resolve(activeSelection.apply(_ => ({
      stackN: _.stackN,
      holeN: _.holeN,
      hasMoved: _.hasMoved
    })));

    activeSelection.mutate(_ => {
      _.active = false;
    });

    effectPersistSelectEnd();
  };

  const actionCancelFxs = async () => {
    for (let key in fxs) {
      fx(key).reject();
    }
    await pDelay(0);
  };

  const actionCancelUserObserves = async () => {
    userObserves.forEach(_ => _.reject());
    await pDelay(0);
  };

  this.remove = async () => {
    running = false;

    await Promise.all([
      actionCancelUserObserves(),
      actionCancelFxs()
    ]);
  };

  this.init = () => {
    actionReset();
    actionDealCards();
    actionLoopAll();
  };

  const userDoubleTapsStack = () => {
    return observeUserDoubleTapStack.begin();
  };

  const userShufflesDraw = () => {
    return observeUserShuffleDraw.begin();
  };

  const userSelectsStack = () => {
    return observeUserSelectStack.begin();
  };

  const userEndsSelect = () => {
    return observeUserEndsSelect.begin();
  };

  const userDealsDraw = () => {
    return observeUserDealDraw.begin();
  };

  const userSelectsDraw = () => {
    return observeUserSelectDraw.begin();
  };

  const userSelectsHole = () => {
    return observeUserSelectHole.begin();
  };

  const actionReset = () => {

    running = true;

    stacks.forEach(_ => 
      _.mutate(_ => _.clear()));

    holes.forEach(_ =>
      _.mutate(_ => _.clear()));

    return Promise.resolve();
  };

  const actionDealCards = async () => {
    deck.shuffle();

    deck.debug();


    drawer.mutate(_ => _.init(deck.drawRest()));
    dealer.init();

    await actionDealCardsStep();
  };

  const actionDealCardsStep = async () => {

    try {

      if (!running) {
        await Promise.reject();
        return;
      }

      let res = dealer.acquireDeal();
      if (!res) {
        await Promise.resolve();
      } else {
        await actionDealCard(res);
        actionDealCardsStep();
      }
    } catch (e) {
      console.warn(e);
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

  const actionSelectStack = async () => {

    let { stackN, cardN } = await userSelectsStack();

    let persistSelected = persistSelection.apply(_ => _.active);

    if (persistSelected) {
      let { stackN: persistStackN,
            cardN,
            holeN: persistHoleN,
            drawN: persistDrawN,
            cards } = persistSelection.apply(_ => _);

      if (isN(persistStackN) && 
          persistStackN !== stackN &&
          canSettleStack(stackN, cards)) {

        effectPersistSelectEnd();
        
        await actionMoveCardsStackStack(persistStackN, stackN, cardN);
        return;
      } else if (isN(persistHoleN) && canSettleStack(stackN, cards)) {

        effectPersistSelectEnd();

        await actionMoveCardsHoleStack(persistHoleN, stackN);
        return;
      } else if (persistDrawN && canSettleStack(stackN, cards)) {
        effectPersistSelectEnd();

        await actionMoveCardsDrawStack(stackN);
        return;
      }
    }

    if (!isN(cardN)) {
      return;
    }

    // let cards = effectStackCut1(stackN, cardN);
    let cards = effectStackCutInProgress(stackN, cardN);

    effectPersistSelectEnd();
    effectBeginSelect(cards);


    // hack
    hackDoubleTapSelectInfo = {
      stackN,
      cards
    };

    let target = await userEndsSelect();

    let { stackN: dstStackN, holeN: dstHoleN, hasMoved } = target;

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

    observeHackDoubleTapSelectInfo.resolve({
      stackN
    });
  };

  const actionMoveCardsDrawStack = async(dstStackN) => {
    let card = effectDrawerDraw(),
        cards = [card];
    
    await fx('move').begin({
      srcDrawN: true,
      dstStackN,
      cards
    });

    effectDrawerCommitDraw();

    effectStackAdd1(dstStackN, cards);

    effectUndoPush(async () => {
      await actionUndoStackSrcDraw(dstStackN, card);
    });
  };

  const actionMoveCardsHoleStack = async(srcHoleN, dstStackN) => {

    let card = effectHoleRemove(srcHoleN),
        cards = [card];
    
    await fx('move').begin({
      srcHoleN,
      dstStackN,
      cards
    });

    effectStackAdd1(dstStackN, cards);

    effectUndoPush(async () => {
      actionUndoStackSrcHole(srcHoleN, dstStackN, cards);
    });
  };

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

    effectUndoPush(async () => {
      await actionUndoStackStack(srcStackN, dstStackN, cards, revealCard);
    });    
  };

  const actionMoveCardsDrawHole = async (dstHoleN) => {
    let card = effectDrawerDraw(),
        cards = [card];

    await fx('move').begin({
      srcDrawN: true,
      dstHoleN,
      cards
    });

    effectDrawerCommitDraw();

    effectHoleAdd(dstHoleN, card);

    effectUndoPush(async () => {
      await actionUndoHoleSrcDraw(dstHoleN, card);
    });
  };

  const actionMoveCardsStackHole = async (srcStackN, dstHoleN) => {
    let card = effectStackCutLast(srcStackN),
        cards = [card];

    let pReveal = actionRevealStack(srcStackN),
        pMove = fx('move').begin({
          srcStackN,
          dstHoleN,
          cards
        });

    let revealCard = await pReveal;
    await pMove;

    effectHoleAdd(dstHoleN, card);

    effectUndoPush(async () => {
      await actionUndoHole(srcStackN, dstHoleN, cards, revealCard);
    });
  };

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

  // Select Hole

  const actionSelectHole = async () => {
    let { holeN } = await userSelectsHole();

    let persistSelected = persistSelection.apply(_ => _.active);

    if (persistSelected) {
      let { stackN: persistStackN,
            drawN: persistDrawN,
            cardN,
            cards } = persistSelection.apply(_ => _);

      if (isN(persistStackN) &&
          canSettleHole(holeN, cards)) {

        effectPersistSelectEnd();

        return await actionMoveCardsStackHole(persistStackN, holeN);
      } else if (persistDrawN &&
                 canSettleHole(holeN, cards)) {
        effectPersistSelectEnd();

        return await actionMoveCardsDrawHole(holeN);
      }
    }

    if (!askHoleRemove(holeN)) {
      return Promise.resolve();
    }

    let card = effectHoleRemove(holeN),
        cards = [card];

    effectPersistSelectEnd();
    effectBeginSelect(cards);

    let target = await userEndsSelect();

    let { stackN: dstStackN, hasMoved } = target;

    if (isN(dstStackN) && canSettleStack(dstStackN, cards)) {
      return await actionSettleStackSrcHole(holeN, dstStackN, cards);
    } else {
      return await actionSettleHoleCancel(holeN, cards, hasMoved);
    }
  };

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

  // Select Draw

  const actionSelectDraw = async () => {
    await userSelectsDraw();

    let card = effectDrawerDraw();

    effectPersistSelectEnd();
    effectBeginSelect([card]);

    let target = await userEndsSelect();

    let { stackN: dstStackN, holeN: dstHoleN, hasMoved } = target;

    if (isN(dstStackN) && canSettleStack(dstStackN, [card])) {
      await actionSettleStackSrcDraw(dstStackN, card);
    } else if (isN(dstHoleN) && canSettleHole(dstHoleN, [card])) {
      await actionSettleHoleSrcDraw(dstHoleN, card);
    } else {
      await actionSettleDrawCancel(card, hasMoved);
    }

    observeHackDoubleTapSelectInfo.resolve({
      drawN: true
    });
  };

  const actionSettleHoleSrcDraw = async (dstHoleN, card) => {
    let cards = [card];

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

  const actionSettleStackSrcDraw = async (dstStackN, card) => {

    let cards = [card];

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

  const actionSettleDrawCancel = async (card, hasMoved) => {
    let cards = [card];
    
    await fx('settle').begin({
      drawN: true,
      cards
    });

    drawer.mutate(_ => _.drawCancel1(card));

    if (!hasMoved) {
      effectPersistSelectDraw(cards);
    }
  };

  // Deal Draw

  const actionDealDraw = async () => {
    await userDealsDraw();

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

  // Undos

  function serialPromise() {
    let lastPromise = Promise.resolve();
    return function(fn) {
      lastPromise = lastPromise.then(fn);
      return lastPromise;
    };
  }

  let userUndosQueue = serialPromise();

  const actionUndosQueue = () => {
    userUndosQueue(actionUndos);
  };

  let i = 0;
  const actionUndos = async () => {
    let canUndo = undoer.apply(_ => _.length > 0);

    if (!canUndo) {
      await Promise.resolve();
      return;
    }

    let undoAction = undoer.mutate(_ => _.pop());

    await undoAction();
  };

  const effectUndoPush = undo => {
    undoer.mutate(_ => _.push(undo));
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

      stackN(srcStackN).mutate(_ => _.unreveal1(revealCard));

      await fx('unreveal').begin({
        stackN: srcStackN,
        card: revealCard
      });

      stackN(srcStackN).mutate(_ => _.unreveal2(revealCard));
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

  // actionUndos = [
  //   actionUndoDealDraw,
  //   actionUndoDrawStack,
  //   actionUndoStackStack,
  //   actionUndoStackHole,
  //   actionUndoHoleStack
  // ];

  // shuffle

  const actionShuffleDraw = async () => {
    await userShufflesDraw();

    let cards = drawer.mutate(_ => _.shuffle1());

    drawer.mutate(_ => _.shuffle2(cards));

    effectUndoPush(async () => {
      await actionUndoShuffleDraw();
    });
  };

  // double tap stack

  let hackDoubleTapSelectInfo;

  const actionDoubleTapStack = async () => {
    // probably not needed this
    await userDoubleTapsStack();

    let { stackN: _stackN, drawN } = 
        await observeHackDoubleTapSelectInfo.begin();

    if (isN(_stackN)) {

      let card = stackN(_stackN).apply(_ => _.topCard());
      let _holeN = findHoleCanAddCard(card);

      if (isN(_holeN)) {
        await actionMoveCardsStackHole(_stackN, _holeN);
      }

    } else if (drawN) {
      let card = drawer.apply(_ => _.topCard());
      let _holeN = findHoleCanAddCard(card);

      if (isN(_holeN)) {
        await actionMoveCardsDrawHole(_holeN);
      }
    }
  };

  const findHoleCanAddCard = (card) => {
    return holes.findIndex(_ => _.apply(_ => _.canAdd([card])));    
  };


  let actionLoops = [
    actionShuffleDraw,
    actionDealDraw,
    actionSelectDraw,
    actionSelectHole,
    actionSelectStack,
    actionDoubleTapStack
  ];

  const actionLoopAll = () => {
    actionLoops.forEach(makeActionLoop);
  };

  const makeActionLoop = async (action) => {
    try {
      while (running) {
        await action();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Permissions

  const canSettleHole = (dstHoleN, cards) => {
    return holeN(dstHoleN)
      .apply(_ => _.canAdd(cards));
  };

  const canSettleStack = (dstStackN, cards) => {
    return stackN(dstStackN)
      .apply(_ => _.canAdd(cards));
  };

}
