import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';
import SoliDeal from './solideal';

import { pobservable, observable } from './observable';

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

  let drawer = this.drawer = observable(new SoliDrawDeck());

  let beginSelection = this.bSelection = observable({});
  let activeSelection = this.aSelection = observable({});

  let persistSelection = this.pSelection = observable({});

  let observeUserSelectStack = pobservable(),
      observeUserEndsSelect = pobservable();

  let observeUserDealDraw = pobservable(),
      observeUserSelectDraw = pobservable();

  let fxs = {
    'deal': pobservable(),
    'settle': pobservable(),
    'reveal': pobservable(),
    'move': pobservable(),
    'dealdraw': pobservable()
  };

  let dealer = new SoliDeal();

  let holeN = this.holeN = n => holes[n];
  let stackN = this.stackN = n => stacks[n];
  let fx = this.fx = name => fxs[name];

  let deck = makeOneDeck();

  this.userActionDealDraw = () => {
    observeUserDealDraw.resolve();
  };

  this.userActionSelectDraw = (epos, decay) => {
    observeUserSelectDraw.resolve();
    activeSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.holeN = false;
      _.hasMoved = false;
      _.epos = epos;
      _.decay = decay;
    });
  };

  this.userActionSelectStack = (stackN, cardN, epos, decay) => {
    observeUserSelectStack.resolve({
      stackN,
      cardN,
      epos,
      decay });

    activeSelection.mutate(_ => {
      _.active = true;
      _.stackN = false;
      _.holeN = false;
      _.hasMoved = false;
      _.epos = epos;
      _.decay = decay;
    });
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
  };

  this.init = () => {
    actionReset();
    actionDealCards();
    actionSelectionStep();
    actionSelectDrawStep();
    actionDealDrawStep();
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

  const actionReset = () => {
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
    let res = dealer.acquireDeal();
    if (!res) {
      Promise.resolve();
    } else {
      await actionDealCard(res);
      actionDealCardsStep();
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
            cards } = persistSelection
          .apply(_ => _);

      if (persistStackN !== stackN) {

        effectPersistSelectEnd();
        
        return await actionMoveCards(persistStackN, stackN, cardN);
      }
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

  const actionMoveCards = async (srcStackN, dstStackN, cardN) => {

    let cards = effectStackCut1(srcStackN, cardN);

    let pReveal = actionRevealStack(srcStackN),
        pMove = fx('move').begin({
          srcStackN,
          dstStackN,
          cards
        });

    await Promise.all([pReveal, pMove]);

    effectStackAdd1(dstStackN, cards);
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

    await actionRevealStack(srcStackN);
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
      await Promise.resolve();
      return;
    }

    let last = stackN(_stackN)
        .mutate(_ => _.reveal1());

    await fx('reveal').begin({
      stackN: _stackN,
      card: last
    });

    effectStackAdd1(_stackN, [last]);
  };

  const effectPersistSelectEnd = () => {
    persistSelection.mutate(_ => {
      _.active = false;
    });
  };

  const effectPersistSelectStack = (_stackN, cards) => {
    let cardN = stackN(_stackN)
        .apply(_ => 
          _.front.indexOf(cards[0]));

    persistSelection.mutate(_ => {
      _.active = true;
      _.stackN = _stackN;
      _.cards = cards;
      _.cardN = cardN;
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

  const actionSelectionStep = async () => {
    await actionSelectStack();
    actionSelectionStep();
  };

  // Select Draw

  const actionSelectDraw = async () => {
    await userSelectsDraw();

    let card = drawer.mutate(_ => _.draw1());

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


    effectStackAdd1(dstStackN, cards);
  };

  const actionSettleDrawCancel = async (card, hasMoved) => {
    await fx('settle').begin({
      drawN: true,
      cards: [card]
    });

    drawer.mutate(_ => _.drawCancel1(card));

    if (!hasMoved) {
      // effetPersistSelectDraw();
    }
  };

  const actionSelectDrawStep = async () => {
    await actionSelectDraw();
    actionSelectDrawStep();
  };

  // Deal Draw

  const actionDealDraw = async () => {
    await userDealsDraw();

    let card = effectDealDraw();

    await fx('dealdraw').begin(card);

    drawer.mutate(_ => _.dealOne2(card));
  };

  const effectDealDraw = () => {
    return drawer.mutate(_ => _.dealOne1());
  };

  const actionDealDrawStep = async () => {
    await actionDealDraw();
    actionDealDrawStep();
  };
}
