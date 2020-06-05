import { makeOneDeck } from './deck';
import { SoliStack, SoliDrawDeck } from './soliutils';
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

  let stackDraw = observable(new SoliDrawDeck());

  let beginSelection = this.bSelection = observable({});
  let activeSelection = this.aSelection = observable({});

  let observeUserSelectStack = pobservable(),
      observeUserEndsSelect = pobservable();

  let fxs = {
    'deal': pobservable(),
    'settle': pobservable()

  };

  let dealer = new SoliDeal();

  let stackN = this.stackN = n => stacks[n];
  let fx = this.fx = name => fxs[name];

  let deck = makeOneDeck();

  this.userActionSelectStack = (stackN, cardN, epos, decay) => {
    observeUserSelectStack.resolve({
      stackN,
      cardN,
      epos,
      decay });

    activeSelection.mutate(_ => {
      _.epos = epos;
      _.decay = decay;
    });
  };

  this.userActionMove = (epos) => {
    activeSelection.mutate(_ => _.epos = epos);
  };


  this.userActionEndSelectStack = (stackN) => {
    activeSelection.mutate(_ => _.stackN = stackN);
  };


  const effectBeginSelect = (cards) => {
    beginSelection.mutate(_ => _.cards = cards);
  };

  this.userActionEndTap = () => {
    observeUserEndsSelect.resolve(activeSelection.apply(_ => ({
      stackN: _.stackN
    })));
  };

  this.init = () => {
    actionReset();
    actionDealCards();
    actionSelectionStep();
  };

  const userSelectsStack = () => {
    return observeUserSelectStack.begin();
  };

  const userEndsSelect = () => {
    return observeUserEndsSelect.begin();
  };

  const actionReset = () => {
    stacks.forEach(_ => 
      _.mutate(_ => _.clear()));

    return Promise.resolve();
  };

  const actionDealCards = async () => {
    deck.shuffle();

    stackDraw.mutate(_ => _.init(deck.drawRest()));
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

    let card = stackDraw
        .mutate(_ => _.dealDraw1()),
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

    let cards = effectStackCut1(stackN, cardN);

    effectBeginSelect(cards);

    let target = await userEndsSelect();

    let { stackN: dstStackN, holeN: dstHoleN, hasMoved } = target;

    if (dstStackN) {
      return Promise.resolve();
    } else {
      return await actionSettleStackCancel(stackN, cards, hasMoved);
    }
  };

  const actionSettleStackCancel = async (stackN, cards, hasMoved) => {

    await fx('settle').begin({
      stackN,
      cards
    });

    effectStackAdd1(stackN, cards);
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
}
