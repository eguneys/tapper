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

  let observeUserUndo = pobservable();

  let userObserves = [
    observeUserSelectStack,
    observeUserEndsSelect,
    observeUserDealDraw,
    observeUserSelectDraw,
    observeUserSelectHole,
    observeUserUndo
  ];

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

  this.userActionUndo = async () => {
    observeUserUndo.resolve();
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

  const userUndos = () => {
    return observeUserUndo.begin();
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

    return Promise.resolve();
  };

  const actionDealCards = async () => {
    deck.shuffle();

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

      if (isN(persistStackN) && persistStackN !== stackN) {

        effectPersistSelectEnd();
        
        return await actionMoveCardsStackStack(persistStackN, stackN, cardN);
      } else if (isN(persistHoleN)) {

        effectPersistSelectEnd();

        return await actionMoveCardsHoleStack(persistHoleN, stackN);
      } else if (persistDrawN) {
        effectPersistSelectEnd();

        return await actionMoveCardsDrawStack(stackN);
      }
    }

    if (!isN(cardN)) {
      return Promise.resolve();
    }

    let cards = effectStackCut1(stackN, cardN);

    effectPersistSelectEnd();
    effectBeginSelect(cards);

    let target = await userEndsSelect();

    let { stackN: dstStackN, holeN: dstHoleN, hasMoved } = target;

    if (isN(dstHoleN)) {
      return await actionSettleHole(stackN, dstHoleN, cards);
    } else if (isN(dstStackN) && dstStackN !== stackN) {
      return await actionSettleStack(stackN, dstStackN, cards);
    } else {
      return await actionSettleStackCancel(stackN, cards, hasMoved);
    }
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
  };

  const actionMoveCardsStackStack = async (srcStackN, dstStackN, cardN) => {

    let cards = effectStackCut1(srcStackN, cardN);

    let pReveal = actionRevealStack(srcStackN),
        pMove = fx('move').begin({
          srcStackN,
          dstStackN,
          cards
        });

    await pReveal;
    await pMove;

    effectStackAdd1(dstStackN, cards);

    
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

    await Promise.all([pReveal, pMove]);

    effectHoleAdd(dstHoleN, card);
  };

  const actionSettleHole = async (srcStackN, dstHoleN, cards) => {
    await fx('settle').begin({
      holeN: dstHoleN,
      cards
    });

    effectHoleAdd(dstHoleN, cards[0]);

    await actionRevealStack(srcStackN);
  };

  const actionSettleStack = async (srcStackN, dstStackN, cards) => {
    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });

    effectStackAdd1(dstStackN, cards);

    let revealCard = await actionRevealStack(srcStackN);

    effectUndoPush(() => {
      actionUndoStackStack(srcStackN, dstStackN, cards, revealCard);
    });
  };

  const actionSettleStackCancel = async (stackN, cards, hasMoved) => {

    await fx('settle').begin({
      stackN,
      cards
    });

    effectStackAdd1(stackN, cards);

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

  const effectPersistSelectHole = (_holeN) => {
    persistSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.cardN = false;
      _.holeN = false;
      _.drawN = false;

      _.holeN = _holeN;
    });
  };

  const effectPersistSelectDraw = () => {
    persistSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.cardN = false;
      _.holeN = false;
      _.drawN = false;

      _.drawN = true;
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
            cardN,
            cards } = persistSelection.apply(_ => _);

      if (isN(persistStackN)) {

        effectPersistSelectEnd();

        return await actionMoveCardsStackHole(persistStackN, holeN);
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

    if (isN(dstStackN)) {
      return await actionSettleStackSrcHole(dstStackN, cards);
    } else {
      return await actionSettleHoleCancel(holeN, cards, hasMoved);
    }
  };

  const actionSettleStackSrcHole = async (dstStackN, cards) => {
    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });

    effectStackAdd1(dstStackN, cards);
  };

  const actionSettleHoleCancel = async (holeN, cards, hasMoved) => {
    await fx('settle').begin({
      holeN,
      cards
    });

    effectHoleRemoveCancel(holeN, cards[0]);

    if (!hasMoved) {
      effectPersistSelectHole(holeN);
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

    let { stackN: dstStackN, hasMoved } = target;

    if (isN(dstStackN)) {
      return await actionSettleStackSrcDraw(dstStackN, card);
    } else {
      return await actionSettleDrawCancel(card, hasMoved);
    }    
  };

  const actionSettleStackSrcDraw = async (dstStackN, card) => {

    let cards = [card];

    await fx('settle').begin({
      stackN: dstStackN,
      cards
    });

    effectDrawerCommitDraw();

    effectStackAdd1(dstStackN, cards);
  };

  const actionSettleDrawCancel = async (card, hasMoved) => {
    await fx('settle').begin({
      drawN: true,
      cards: [card]
    });

    drawer.mutate(_ => _.drawCancel1(card));

    if (!hasMoved) {
      effectPersistSelectDraw();
    }
  };

  // Deal Draw

  const actionDealDraw = async () => {
    await userDealsDraw();

    let card = effectDealDraw();

    await fx('dealdraw').begin(card);

    drawer.mutate(_ => _.dealOne2(card));
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

  // Undo

  const actionUndos = async () => {
    await userUndos();

    let canUndo = undoer.apply(_ => _.length > 0);

    if (!canUndo) {
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


  // actionUndos = [
  //   actionUndoDealDraw,
  //   actionUndoDrawStack,
  //   actionUndoStackStack,
  //   actionUndoStackHole,
  //   actionUndoHoleStack
  // ];

  let actionLoops = [
    actionDealDraw,
    actionSelectDraw,
    actionSelectHole,
    actionSelectStack,
    actionUndos
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
}
