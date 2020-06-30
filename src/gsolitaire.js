import { makeOneDeck } from './deck';
import { stackPlate, 
         holePlate, 
         isN, 
         SoliStack,
         SoliHole,
         SoliDrawDeck } from './soliutils';
import SoliDeal from './solideal';
import SoliHoller from './soliholler';

import { pobservable, observable } from './observable';

import { fId, fConstant, fNull, fBoolean } from './futils';

const pDelay = d => {
  return new Promise(resolve => setTimeout(resolve, d));
};

export default function GSolitaire(cardGame) {
  

  let stacks = stackPlate.map(_ => 
    observable(new SoliStack()));

  let holes = holePlate.map(_ => 
    observable(new SoliHole()));

  let drawer = observable(new SoliDrawDeck());

  let undoer = this.undoer = observable([]);

  let beginSelection = this.bSelection = observable({});
  let activeSelection = this.aSelection = observable({});

  let persistSelection = this.pSelection = observable({});

  let oSaveState = this.oSaveState = observable(null);

  let oShowTutorial = this.oShowTutorial = observable(null);

  let oGameReset = this.oGameReset = observable(null);

  let oGameOver = this.oGameOver = observable(null);

  let dealer = new SoliDeal();

  let holler = new SoliHoller();

  let fxs = {
    'deal': pobservable(),
    'settle': pobservable(),
    'reveal': pobservable(),
    'move': pobservable(),
    'dealdraw': pobservable(),
    'unreveal': pobservable()
  };

  let holeEnd = holePlate
      .map(_ => 
        observable(null));
  let holeIn = holePlate
      .map(_ =>
        observable(null));

  let holeEndN = this.holeEndN = n => holeEnd[n];
  let holeInN = this.holeInN = n => holeIn[n];

  let holeN = this.holeN = n => holes[n];
  let stackN = this.stackN = n => stacks[n];
  let fx = this.fx = name => fxs[name];
  this.drawer = drawer;

  let deck = makeOneDeck();

  // TODO unify in one place
  /*
   *  Read Write state
   */
  const writeState = () => {
    const applyWrite = _ => _.apply(fId).write();

    let eStacks = stacks.map(applyWrite);
    let eHoles = holes.map(applyWrite);
    let eDrawer = applyWrite(drawer);

    return `${eStacks.join('!')} ${eHoles.join('!')} ${eDrawer}`;
  };

  const readState = (play) => {
    const mutateRead = (_, state) => 
          _.mutate(_ => 
            _.read(state));

    let [eStacks, eHoles, eDrawer] = play.split(' ');

    eStacks = eStacks.split('!');
    eHoles = eHoles.split('!');

    eStacks.forEach((eStack, i) => {
      mutateRead(stackN(i), eStack);
    });

    eHoles.forEach((eHole, i) => {
      mutateRead(holeN(i), eHole);
    });

    mutateRead(drawer, eDrawer);    
  };


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
    await actionCancelFxs();
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

    undoer.set(_ => []);

    stacks.forEach(_ =>
      _.mutate(_ => _.clear()));

    holes.forEach(_ =>
      _.mutate(_ => _.clear()));

    drawer.mutate(_ => _.options(options));

    oGameReset.set(fId);

    oGameOver.set(fNull);
  };

  const actionResume = async play => {
    readState(play);
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

    let cards = drawer.mutate(_ => _.dealOnlyOne());

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

    let cards = effectDealDraw();

    await fx('dealdraw').begin(cards);

    drawer.mutate(_ => _.dealOne2(cards));

    actionPushUndoAndSaveState(async () => {
      await actionUndoDealDraw(cards);
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
   * Game Over Holl Cards
   */
  const actionGameOver = async () => {
    let gameOverData = {};
    oGameOver.set(fConstant(gameOverData));

    await actionHollCards();
  };

  const actionHollCards = async () => {

    holler.init();

    while (isRunning) {
      let _holeN = holler.acquireHole();

      if (!isN(_holeN)) {
        break;
      }

      await pDelay(20 + Math.random() * 50);
      await actionHollCard(_holeN);
    }
  };

  const actionHollCard = async (_holeN) => {
    let hole = holeN(_holeN);

    let card = hole.mutate(_ => _.remove());

    holeEndN(_holeN).set(_ => card);

    holeInN(_holeN).set(fId);
  };

  /*
   *  Action Hole Add
   */
  const actionHoleAdd = async (_holeN, card) => {

    holeInN(_holeN).set(fId);
    
    effectHoleAdd(_holeN, card);

    let allDone = true;
    holePlate.forEach(i => {
      let hole = holeN(i);
      
      allDone = allDone && hole
        .apply(_ => _.isDone());
    });

    if (allDone) {
      await actionGameOver();
    }
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
   * Save State Effect
   */
  const actionPushUndoAndSaveState = undo => {
    effectUndoPush(undo);

    actionSaveState();
  };

  const actionSaveState = () => {
    let state = writeState();
    effectSaveState(state);    
  };

  const effectSaveState = (state) => {
    oSaveState.set(_ => state);
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
   * Settle Stack
   */

  const actionSettleHole = async (srcStackN, dstHoleN, cards) => {
    await fx('settle').begin({
      holeN: dstHoleN,
      cards
    });

    actionHoleAdd(dstHoleN, cards[0]);

    let revealCard = await actionRevealStack(srcStackN);

    actionPushUndoAndSaveState(async () => {
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

    actionHoleAdd(dstHoleN, card);

    actionPushUndoAndSaveState(async () => {
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

    actionPushUndoAndSaveState(async () => {
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

    actionPushUndoAndSaveState(async () => {
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
   *  Move Cards
   */

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

    actionPushUndoAndSaveState(async () => {
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

    actionPushUndoAndSaveState(async () => {
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

    actionPushUndoAndSaveState(async () => {
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

    actionHoleAdd(dstHoleN, card);

    actionPushUndoAndSaveState(async () => {
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

    actionHoleAdd(dstHoleN, card);

    actionPushUndoAndSaveState(async () => {
      await actionUndoHole(srcStackN, dstHoleN, cards, revealCard);
    });
  };
  

  /*
   *  Shuffle Draw
   */

  const actionShuffleDraw = async () => {
    let canShuffle = drawer.apply(_ => _.canShuffle());

    if (!canShuffle) {
      return;
    }

    let cards = drawer.mutate(_ => _.shuffle1());

    drawer.mutate(_ => _.shuffle2(cards));

    actionPushUndoAndSaveState(async () => {
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

      if (isN(dstStackN) || isN(dstHoleN)) {
        actionMaybeShowTutorial();
      }
      await actionSettleDrawCancel(cards, hasMoved);
    }
  };

  /* 
   * Select/Drop Stack
   */

  const actionPersistSelectStack = async (stackN, cardN) => {
    let persistSelected = persistSelection
        .apply(_ => _.active);

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
        return true;
      } else if (isN(persistHoleN) && canSettleStack(stackN, cards)) {

        effectPersistSelectEnd();

        await actionMoveCardsHoleStack(persistHoleN, stackN);
        return true;
      } else if (persistDrawN && canSettleStack(stackN, cards)) {
        effectPersistSelectEnd();

        await actionMoveCardsDrawStack(stackN);
        return true;
      }
    }
    return false;
  };

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
      if (isN(dstStackN) || isN(dstHoleN)) {
        actionMaybeShowTutorial();
      }
      await actionSettleStackCancel(stackN, cards, hasMoved);
    }
  };

  /*
   * Select/Drop Hole
   */

  const actionPersistSelectHole = async (holeN) => {
    let persistSelected = persistSelection
        .apply(_ => _.active);

    if (persistSelected) {
      let { stackN: persistStackN,
            drawN: persistDrawN,
            cardN,
            cards } = persistSelection.apply(_ => _);

      if (isN(persistStackN) &&
          canSettleHole(holeN, cards)) {

        effectPersistSelectEnd();

        await actionMoveCardsStackHole(persistStackN, holeN);
        return true;
      } else if (persistDrawN &&
                 canSettleHole(holeN, cards)) {
        effectPersistSelectEnd();

        await actionMoveCardsDrawHole(holeN);
        return true;
      }
    }
    return false;
  };

  const actionSelectHole = async (orig) => {
    let { holeN } = orig;

    let persistResult = 
        await actionPersistSelectHole(holeN);

    if (persistResult) {
      return;
    }

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
      await actionSettleStackSrcHole(holeN, dstStackN, cards);
    } else {
      if (isN(dstStackN)) {
        actionMaybeShowTutorial();
      }
      await actionSettleHoleCancel(holeN, cards, hasMoved);
    }    
  };

  /*
   * Action Drag Start
   */
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
    } else {
      effectPersistSelectEnd();
    }

    activeSelection.mutate(_ => {
      _.activeEnding = false;
    });
    effectActiveDeselect();
  };

  /*
   * Action Double Click
   */
  const actionDoubleClick = async dest => {
    let { stackN: _stackN, drawN } = dest;


    let { 
      activeEnding,
      active } = activeSelection.apply(fId);

    if (active || activeEnding) {
      console.log('still active');
      return;
    }

    if (isN(_stackN)) {

      let card = stackN(_stackN).apply(_ => _.topCard());

      // no card for empty stack
      if (!card) {
        console.log('no card');
        return;
      }

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
    return holes
      .findIndex(_ => 
        _.apply(_ => _.canAdd([card])));
  };


  /*
   * Show Tutorial
   */
  const actionMaybeShowTutorial = () => {
    let showTutorial = cardGame
        .oOptions
        .showTutorial
        .solitaire
        .apply(fId);

    if (showTutorial) {
      effectShowTutorial();
    }
  };

  const effectShowTutorial = () => {
    oShowTutorial.set(fId);
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

  const whilePlaying = fn => {
    return async (...args) => {
      let gameOver = oGameOver.apply(fBoolean);
      if (gameOver) {
        return;
      }
      await fn(...args);
    };
  };

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

  this.userActionDoubleClick = whilePlaying(async (dest) => {
    await actionDoubleClick(dest);
  });

  this.userActionShuffle = whilePlaying(async () => {
    await userActionsQueue(actionShuffleDraw);
  });

  this.userActionUndo = whilePlaying(async () => {
    await userActionsQueue(actionUndos);
  });
  
}
