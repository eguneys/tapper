import { objMap } from './util2';
import * as Bacon from 'baconjs';

import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';

import RSoliDealer from './rsolidealer';

export default function RSolitaire(esDrags, esDrops) {

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

  let bHanging = new Bacon.Bus();

  let pDragDrop = DragDropProperty(bHanging, esDrags, esDrops);

  let esDragStackStart = pDragDrop
      .flatMap(_ => _.dragStackStart?
               _.dragStackStart:Bacon.never())
      .toEventStream();

  let esDragStackCancel = pDragDrop
      .flatMap(_ => _.dragStackCancel?
               _.dragStackCancel:Bacon.never())
      .toEventStream();

  let esStackDragStart = esDragStackStart;
  let esStackDragCancel = esDragStackCancel;

  let esHAppend = bHanging.filter(_ => _.append);
  let esHInit = bHanging.filter(_ => _.init);

  let pHanging = HangingStateProperty(esHInit, esHAppend);
  
  let pDrawer = DrawerProperty(bHanging, esInit, esDealOne1);

  let essStack = {
    esDealOne2,
    esStackDragStart,
    esStackDragCancel
  };

  const mapToI = (os, n) =>
        objMap(os, (_, es) =>
          es.filter(_ => _.i === n));

  let pStacks = [
    StackProperty(bHanging, mapToI(essStack, 0), pHanging),
    StackProperty(bHanging, mapToI(essStack, 1), pHanging),
    StackProperty(bHanging, mapToI(essStack, 2), pHanging),
    StackProperty(bHanging, mapToI(essStack, 3), pHanging),
    StackProperty(bHanging, mapToI(essStack, 4), pHanging),
    StackProperty(bHanging, mapToI(essStack, 5), pHanging),
    StackProperty(bHanging, mapToI(essStack, 6), pHanging)
  ];

  this.pStackN = n => pStacks[n];
  this.pDrawer = pDrawer;
  this.pHanging = pHanging;

  pDrawer.log();
  // pHanging.log();
  // pDragDrop.log();
}

function DragDropProperty(bHanging, esDrags, esDrops) {

  let esDragStackStart = esDrags
      .filter(_ => _.initial && isN(_.stackN))
      .map(_ => ({
        i: _.stackN,
        ..._
      }));

  let esDragMove = esDrags
      .filter(_ => !_.initial && !isN(_.stackN));

  let esDropCancel = esDrops
      .filter(_ => !isN(_.stackN));

  const dragMove = (_, dragMove) => {
    bHanging.push({ append: 
                    { moving: dragMove }
                  });

    if (_.dragStackStart) {
      return { dragMove: _.dragStackStart };
    } else if (_.dragMove) {
      return _;
    } else {
      return {};
    }
  };

  const dragStackStart = (_, dragStackStart) => {

    bHanging.push({ init: { drag: true, start: dragStackStart }});

    return {
      dragStackStart
    };
  };

  const dropCancel = (_, __) => {
    if (_.dragStackStart) {
      return {
        dragStackCancel: _.dragStackStart
      };
    } else if (_.dragMove) {
      return {
        dragStackCancel: _.dragMove
      };
    } else {
      return {};
    }
  };

  return Bacon.update
  ({}, [esDragStackStart, dragStackStart],
   [esDragMove, dragMove],
   [esDropCancel, dropCancel]);
  
}

function HangingStateProperty(esHInit, esHAppend) {
  let init = (_, { init }) => {
    return init;
  };
  let append = (_, { append }) => {
    return { ..._, ...append };
  };

  return Bacon.update({},
                      [esHInit, init],
                      [esHAppend, append]);
}


function DrawerProperty(bHanging, esInit, esDealOne1) {
  let init = (_, cards) => {
    _.init(cards);
    return _; };
  let dealOne1 = (_) => { 
    let card = _.dealOne1();
    bHanging.push({ init: 
                    { deal: true, 
                      cards: [card] } });

    return _; };

  return Bacon.update(new SoliDrawDeck(),
                      [esInit, init],
                      [esDealOne1, dealOne1]);
}

function StackProperty(bHanging, {
  esDealOne2,
  esStackDragCancel,
  esStackDragStart},
                       pHanging) {

  let dragStart = (_, { cardN }) => {
    let cards = _.cutInProgress(cardN);
    bHanging.push({ append: { cards } });
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

  let dragCancel = (_, __, hangingState) => {
    bHanging.push({ init: { } });
    let cards = hangingState.cards;
    _.add1(cards);
    _.cutInProgressCommit();
    return _;
  };

  return Bacon.update(new SoliStack(),
                      [esDealOne2, pHanging, dealOne2],
                      [esStackDragCancel, pHanging, dragCancel],
                      [esStackDragStart, dragStart]);
}
