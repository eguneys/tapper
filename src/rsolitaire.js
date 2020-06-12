import * as Bacon from 'baconjs';

import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';

import RSoliDealer from './rsolidealer';

export default function RSolitaire(esUserDragsStacks) {

  let deck = makeOneDeck();

  const makeEsDealer = () => RSoliDealer();
  const makeEsTweenDeal = (duration = 20) =>
        Bacon.sequentially(duration/11, [0, 
                                   0.1,
                                   0.2,
                                   0.3,
                                   0.4,
                                   0.5,
                                   0.6,
                                   0.7,
                                   0.8,
                                   0.9,
                                   1.0]);

  let esUserInit = Bacon.once(true);

  let esInit = esUserInit.doAction(_ => {
    deck.shuffle();
  }).map(_ => deck.drawRest());

  let esDealCards = esInit
      .flatMapLatest(_ => makeEsDealer());

  let esDealOne = esDealCards.flatMapConcat(_ => 
    Bacon.once({ dealOne: true, ..._ })
      .concat(makeEsTweenDeal()
              .filter(_ => false))
      .concat(Bacon.once({ dealOne2: true }))
  );

  let esDealOne1 = esDealOne.filter(_ => _.dealOne);
  let esDealOne2 = esDealOne.filter(_ => _.dealOne2);
    
  let wholeProperty = WholeProperty(esInit, 
                                    esDealOne1,
                                    esDealOne2);

  this.pStackN = n => wholeProperty
    .map(({ stacks }) => stacks[n]);

  esUserDragsStacks.map(_ => _.epos).log();

}

function WholeProperty(esInit, esDealOne1, esDealOne2) {
  let init = (_, cards) => {
    let { drawer } = _;
    drawer.init(cards);
    return _; };
  let dealOne1 = (_, oDeal) => { 
    let { hidden, i } = oDeal;
    let { drawer } = _;

    let card = drawer.dealOne1();

    _.oDeal = {
      i,
      hidden,
      cards: [card]
    };

    return _; };
  let dealOne2 = _ => {
    let { stacks, oDeal: { i, hidden, cards } } = _;
    
    if (hidden) {
      stacks[i].hide1(cards);
    } else {
      stacks[i].add1(cards);
    }

    return _;
  };

  return Bacon.update({
    drawer: new SoliDrawDeck(),
    stacks: [
      new SoliStack(),
      new SoliStack(),
      new SoliStack(),
      new SoliStack(),
      new SoliStack(),
      new SoliStack(),
      new SoliStack()
    ]
  }, 
                      [esInit, init],
                      [esDealOne1, dealOne1],
                      [esDealOne2, dealOne2]);
}
