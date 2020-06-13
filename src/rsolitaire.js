import { objMap } from './util2';
import * as Bacon from 'baconjs';

import FxBus from './rfxbus';

import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';

import RSoliDealer from './rsolidealer';

export default function RSolitaire(esDrags, esDrops) {

  let deck = makeOneDeck();

  const makeEsDealer = () => RSoliDealer();

  let _fxBus = new FxBus();

  let { bFx, prependWithFx, initPrependWithFx } = _fxBus;

  let esUserInit = Bacon.once(true);

  let esInit = esUserInit.doAction(_ => {
    deck.shuffle();
  }).map(_ => deck.drawRest());

  let esDealCards = esInit
      .flatMapLatest(_ => makeEsDealer());

  let esDealOne = esDealCards.flatMapConcat(_ => 
    Bacon.once({ dealOne: true, ..._ })
      .concat(
        prependWithFx({ dealOne2: true, ..._ },
                      'dealOne'))
  );

  let esDealOne1 = esDealOne.filter(_ => _.dealOne);
  let esDealOne2 = esDealOne.filter(_ => _.dealOne2);

  let bHanging = new Bacon.Bus();

  let pDragDrop = DragDropProperty(bHanging, esDrags, esDrops);

  const withI = (obj, pullI) => ({
    i: pullI(obj),
    ...obj
  });

  let esDragStackStart = pDragDrop
      .flatMap(_ => _.dragStackStart?
               withI(_.dragStackStart,
                     _ => _.stackN)
               :Bacon.never())
      .toEventStream();

  let esDragStackCancel = pDragDrop
      .flatMap(_ => {
        return _.dragStackCancel?
          initPrependWithFx('settle', {
            oSettle: { 
              stackN: _.dragStackCancel.stackN }
          }, withI(_.dragStackCancel, 
                   _ => _.stackN), 100):
        Bacon.never();
      })
      .toEventStream();

  let esDragStackDropStack = pDragDrop
      .flatMap(_ => {
        return _.dragStackDropStack?
          initPrependWithFx('settle', {
            oSettle: {
              stackN: _.dragStackDropStack.drop.stackN
            }
          }, withI(_.dragStackDropStack, 
                   _ => _.drop.stackN), 100):
          Bacon.never();
      }).toEventStream();

  let esStackDragStart = esDragStackStart;
  let esStackDragCancel = esDragStackCancel;
  let esStackDropStack = esDragStackDropStack;

  let esHInit = bHanging.filter(_ => _.init);
  let esHAppend = bHanging.filter(_ => _.append);

  let pHanging = HangingStateProperty(esHInit, esHAppend);

  const fxProperty = name => {
    let esFxInit = bFx.filter(_ => _.init);
    let esFxAppend = bFx.filter(_ => _.append);
    const filterName = (es, name) => es
          .filter(_ => _.name === name);

    return HangingStateProperty(filterName(esFxInit, name),
                                filterName(esFxAppend, name));
  };

  let pFx = {
    dealOne: fxProperty('dealOne'),
    settle: fxProperty('settle')
  };
  
  let pDrawer = DrawerProperty(bHanging, esInit, esDealOne1);

  let essStack = {
    esDealOne2,
    esStackDragStart,
    esStackDragCancel,
    esStackDropStack
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

  this.pFx = name => pFx[name];

  pDrawer.log();
  // pHanging.log();
  // pDragDrop.log();
}

function DragDropProperty(bHanging, esDrags, esDrops) {

  let esDragStackStart = esDrags
      .filter(_ => _.initial && isN(_.stackN));

  let esDragMove = esDrags
      .filter(_ => !_.initial && !isN(_.stackN));

  let esDropCancel = esDrops
      .filter(_ => !isN(_.stackN));

  let esDropStack = esDrops
      .filter(_ => isN(_.stackN));

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

  const dropStack = (_, esDrop) => {
    let dragStackMove = _.dragStackStart || _.dragMove;
    if (dragStackMove) {
      return {
        dragStackDropStack: { drag: dragStackMove,
                              drop: esDrop }
      };
    } else {
      return {};
    }
  };

  return Bacon.update
  ({}, [esDragStackStart, dragStackStart],
   [esDragMove, dragMove],
   [esDropCancel, dropCancel],
   [esDropStack, dropStack]);
  
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
  esStackDragStart,
  esStackDropStack },
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

  let dropStack = (_, __, hangingState) => {
    bHanging.push({ init: { } });

    let cards = hangingState.cards;
    _.add1(cards);
    return _;
  };

  return Bacon.update(new SoliStack(),
                      [esDealOne2, pHanging, dealOne2],
                      [esStackDragCancel, pHanging, dragCancel],
                      [esStackDropStack, pHanging, dropStack],
                      [esStackDragStart, dragStart]);
}
