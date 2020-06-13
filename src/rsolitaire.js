import { objMap } from './util2';
import * as Bacon from 'baconjs';

import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';

import RSoliDealer from './rsolidealer';

export default function RSolitaire(esUserDragsStack) {

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
      .concat(Bacon.once({ dealOne2: true, ..._ }))
  );

  let esDealOne1 = esDealOne.filter(_ => _.dealOne);
  let esDealOne2 = esDealOne.filter(_ => _.dealOne2);

  let esDragStackInitial = esUserDragsStack
      .filter(_ => _.initial)
      .map(_ => ({ i: _.stackN,
                   cardN: _.cardN }));

  let esStackCutInProgress = esDragStackInitial;

  let bHanging = new Bacon.Bus();

  let esSetCards = bHanging.filter(_ => _.cards);

  let pHanging = HangingStateProperty(esSetCards);
    
  let pDrawer = DrawerProperty(bHanging, esInit, esDealOne1);

  let essStack = {
    esDealOne2,
    esStackCutInProgress
  };

  const mapToI = (os, n) =>
        objMap(os, (_, es) =>
          es.filter(_ => _.i === n));

  let pStacks = [
    StackProperty(mapToI(essStack, 0), pHanging),
    StackProperty(mapToI(essStack, 1), pHanging),
    StackProperty(mapToI(essStack, 2), pHanging),
    StackProperty(mapToI(essStack, 3), pHanging),
    StackProperty(mapToI(essStack, 4), pHanging),
    StackProperty(mapToI(essStack, 5), pHanging),
    StackProperty(mapToI(essStack, 6), pHanging)
  ];

  this.pStackN = n => pStacks[n];
  this.pDrawer = pDrawer;
  this.pHanging = pHanging;

  pDrawer.log();
}


function HangingStateProperty(esSetCards) {
  let setCards = (_, cards) => {
    return { ..._, ...cards };
  };

  return Bacon.update({},
                      [esSetCards, setCards]);
}


function DrawerProperty(bHanging, esInit, esDealOne1) {
  let init = (_, cards) => {
    _.init(cards);
    return _; };
  let dealOne1 = (_) => { 
    let card = _.dealOne1();
    bHanging.push({ cards: [card] });

    return _; };

  return Bacon.update(new SoliDrawDeck(),
                      [esInit, init],
                      [esDealOne1, dealOne1]);
}

function StackProperty({
  esDealOne2,
  esStackCutInProgress},
                       pHanging) {

  let cutInProgress = (_, { cardN }) => {
    _.cutInProgress(cardN);
    return _;
  };

  let dealOne2 = (_, { i, hidden }, hangingState) => {
    let cards = hangingState.cards;
    if (hidden) {
      _.hide1(cards);
    } else {
      _.add1(cards);
    }

    return _;
  };

  return Bacon.update(new SoliStack(),
                      [esDealOne2, pHanging, dealOne2],
                      [esStackCutInProgress, cutInProgress]);
}
