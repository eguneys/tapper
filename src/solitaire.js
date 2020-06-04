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

  let observeUserSelectStack = pobservable();

  let fxs = {
    'deal': pobservable()
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
  };

  this.userActionMove = () => {
    
  };

  this.userActionEndTap = () => {
    
  };

  this.init = () => {
    actionSelectionStep();
    actionDealCards();
  };

  const userSelectsStack = () => {
    return observeUserSelectStack.begin();
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

  const actionDealCard = (oDeal) => {
    let card = stackDraw
        .mutate(_ => _.dealDraw1());

    return fx('deal').begin({
      stackN: oDeal.i,
      cards: [card],
      isHidden: oDeal.isHidden
    });
  };

  const actionSelectStack = async () => {

    let { stackN, cardN } = await userSelectsStack();

    console.log(stackN, cardN);

    return Promise.resolve();

  };

  const actionSelectionStep = async () => {
    await actionSelectStack();
    actionSelectionStep();
  };
}
