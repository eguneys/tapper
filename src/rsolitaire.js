import { objMap } from './util2';
import * as Bacon from 'baconjs';

import FxBus from './rfxbus';
import { makeEsTween } from './rtween';

import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';

import RSoliDealer from './rsolidealer';

export default function RSolitaire(esDrags, esDrops) {

  let deck = makeOneDeck();

  const makeEsDealer = () => RSoliDealer();

  let _fxBus = new FxBus();

  let { bFx, initWithFxEs, prependWithFx, initPrependWithFx } = _fxBus;

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

  let _bHanging = new HangingBus();

  let esHUpdate = _bHanging.b.filter(_ => _.update);
  let esHRemove = _bHanging.b.filter(_ => _.remove);

  let pHanging = HangingStateProperty(esHUpdate, esHRemove);

  let pDragDrop = DragDropProperty(_bHanging, esDrags, esDrops);

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

  const prependSettleFx = (stackN, prepend) =>
        initPrependWithFx('settle', {
          oSettle: { stackN }
        }, prepend, 100);

  let esDragStackCancel = pDragDrop
      .flatMap(_ => {
        return _.dragStackCancel?
          prependSettleFx(_.dragStackCancel.stackN,
                        withI(_.dragStackCancel, 
                              _ => _.stackN)):
        Bacon.never();
      })
      .toEventStream();

  let esDragStackDropStack = pDragDrop
      .flatMap(_ => {
        return _.dragStackDropStack?
          prependSettleFx(
            _.dragStackDropStack.drop.stackN,
            withI(_.dragStackDropStack, 
                  _ => _.drop.stackN)):
          Bacon.never();
      }).toEventStream();

  let esStackDragStart = esDragStackStart;
  let esStackDragCancel = esDragStackCancel;
  let esStackDropStack = esDragStackDropStack;

  let esStackReveal = esStackDropStack
      .map(_ => withI(_.drag, _ => _.stackN));

  let esStackRevealFxBegin = pHanging
      .filter(_ => _.reveal)
      .map(_ => _.reveal);

  let esStackReveal2 = esStackRevealFxBegin.flatMap(_ => {
    return initPrependWithFx('reveal', {
      oReveal: _
    }, withI(_, _ => _.stackN), 200);
  }).toEventStream();

  const fxProperty = name => {
    let esFxUpdate = bFx.filter(_ => _.update);
    let esFxRemove = bFx.filter(_ => _.remove);
    const filterName = (es, name) => es
          .filter(_ => _.name === name);

    return HangingStateProperty(filterName(esFxUpdate, name),
                                filterName(esFxRemove, name));
  };

  let pFx = {
    dealOne: fxProperty('dealOne'),
    settle: fxProperty('settle'),
    reveal: fxProperty('reveal')
  };
  
  let pDrawer = DrawerProperty(_bHanging, esInit, esDealOne1);

  let essStack = {
    esDealOne2,
    esStackDragStart,
    esStackDragCancel,
    esStackDropStack,
    esStackReveal,
    esStackReveal2
  };

  const mapToI = (os, n) =>
        objMap(os, (_, es) =>
          es.filter(_ => _.i === n));

  const stackProperty = n => 
        StackProperty(n, _bHanging, mapToI(essStack, n), pHanging);

  let pStacks = [
    stackProperty(0),
    stackProperty(1),
    stackProperty(2),
    stackProperty(3),
    stackProperty(4),
    stackProperty(5),
    stackProperty(6),
  ];

  this.pStackN = n => pStacks[n];
  this.pDrawer = pDrawer;
  this.pHanging = pHanging;

  this.pFx = name => pFx[name];

  pDrawer.onValue();
  // pHanging.log();
  // pDragDrop.log();

  // Bacon.repeatedly(1000, [true, false]).doAction(_ => {
  //   console.log(_);
  // }).take(0).log();
}

function StackProperty(n, _bHanging, {
  esDealOne2,
  esStackDragCancel,
  esStackDragStart,
  esStackDropStack,
  esStackReveal,
  esStackReveal2
},
                       pHanging) {

  let dragStart = (_, { cardN }) => {
    let cards = _.cutInProgress(cardN);
    _bHanging.update('dragcards', cards);
    return _;
  };

  let dealOne2 = (_, { i, hidden }, hangingState) => {
    let { cards } = hangingState.deal;
    if (hidden) {
      _.hide1(cards);
    } else {
      _.add1(cards);
    }
    console.log('resmove');
    _bHanging.remove('deal');
    return _;
  };

  let dragCancel = (_, __, hangingState) => {
    let cards = hangingState.dragcards;
    _.add1(cards);
    _.cutInProgressCommit();
    _bHanging.remove('dragcards');
    return _;
  };

  let dropStack = (_, __, hangingState) => {
    let cards = hangingState.dragcards;
    _.add1(cards);
    _.cutInProgressCommit();
    _bHanging.remove('dragcards');
    return _;
  };

  let reveal1 = (_) => {
    if (!_.canReveal()) {
      return _;
    }
    let card = _.reveal1();
    _bHanging.update('reveal', {
      stackN: n,
      card
    });
    return _;
  };

  let reveal2 = (_, __, hangingState) => {
    let { card } = hangingState.reveal;

    _bHanging.remove('reveal');
    _.add1([card]);
    return _;
  };

  return Bacon.update(new SoliStack(),
                      [esDealOne2, pHanging, dealOne2],
                      [esStackDragCancel, pHanging, dragCancel],
                      [esStackDropStack, pHanging, dropStack],
                      [esStackReveal, reveal1],
                      [esStackReveal2, pHanging, reveal2],
                      [esStackDragStart, dragStart]);
}

function DragDropProperty(_bHanging, esDrags, esDrops) {

  let esDragStackStart = esDrags
      .filter(_ => _.initial && isN(_.stackN));

  let esDragMove = esDrags
      .filter(_ => !_.initial && !isN(_.stackN));

  let esDropCancel = esDrops
      .filter(_ => !isN(_.stackN));

  let esDropStack = esDrops
      .filter(_ => isN(_.stackN));

  const dragMove = (_, dragMove) => {
    _bHanging.update('moving', dragMove);

    if (_.dragStackStart) {
      return { dragMove: _.dragStackStart };
    } else if (_.dragMove) {
      return _;
    } else {
      return {};
    }
  };

  const dragStackStart = (_, dragStackStart) => {

    _bHanging.update('dragstart', dragStackStart);

    return {
      dragStackStart
    };
  };

  const dropBase = () => {
    _bHanging.remove('dragstart');
    _bHanging.remove('moving');
  };

  const dropCancel = (_, __) => {
    dropBase();
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
    dropBase();
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

function DrawerProperty(_bHanging, esInit, esDealOne1) {
  let init = (_, cards) => {
    _.init(cards);
    return _; };
  let dealOne1 = (_) => { 
    let card = _.dealOne1();
    console.log('add');
    _bHanging.update('deal',
                     { cards: [card] });

    return _; };

  return Bacon.update(new SoliDrawDeck(),
                      [esInit, init],
                      [esDealOne1, dealOne1]);
}

function HangingStateProperty(esHUpdate, esHRemove) {
  let update = (_, { update }) => {
    let { key, value } = update;
    return {
      ..._,
      [key]: value
    };
  };

  let remove = (_, { remove }) => {
    delete _[remove];
    return _;
  };
  
  return Bacon.update({}, [esHUpdate, update],
                      [esHRemove, remove]);
    
}

function HangingBus() {

  this.b = new Bacon.Bus();

  this.update = (key, value) => {
    this.b.push({ update: { key, value } });
  };
  this.remove = (key) => {
    this.b.push({ remove: key });
  };
};
