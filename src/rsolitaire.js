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
      .concat(makeEsTween()
              .map(_ => ({ dealTween: true, i : _ })))
      .concat(Bacon.once({ dealOne2: true, ..._ }))
  );

  let esDealOne1 = esDealOne.filter(_ => _.dealOne);
  let esDealOne2 = esDealOne.filter(_ => _.dealOne2);

  // let esDealOne = esDealCards.flatMapConcat(_ => 
  //   Bacon.once({ dealOne: true, ..._ })
  //     .concat(
  //       prependWithFx({ dealOne2: true, ..._ },
  //                     'dealOne'))
  // );

  // let esDealOne1 = esDealOne.filter(_ => _.dealOne);
  // let esDealOne2 = esDealOne.filter(_ => _.dealOne2);

  // let _bHanging = new HangingBus();

  // let esHUpdate = _bHanging.b.filter(_ => _.update);
  // let esHRemove = _bHanging.b.filter(_ => _.remove);

  // let pHanging = HangingStateProperty(esHUpdate, esHRemove);

  let pDrawer = DrawerProperty(esInit, esDealOne1, esDealOne2);

  let esDealOne2WithCards = 
      esDealOne2.zip(pDrawer
                     .filter(withExtra('dealcards'))
                     .map(withExtra('dealcards')),
                     (_, cards) => ({ cards, ..._ }));

  let pDragDrop = DragDropProperty(esDrags, esDrops);

  const withI = (obj, pullI) => ({
    i: pullI(obj),
    ...obj
  });

  let esDragStackStart = pDragDrop
      .map(_ => _.base)
      .flatMap(_ => _.dragStackStart?
               withI(_.dragStackStart,
                     _ => _.stackN)
               :Bacon.never())
      .toEventStream();

  // const prependSettleFx = (stackN, prepend) =>
  //       initPrependWithFx('settle', {
  //         oSettle: { stackN }
  //       }, prepend, 100);

  // let esDragStackCancel = pDragDrop
  //     .flatMap(_ => {
  //       return _.dragStackCancel?
  //         prependSettleFx(_.dragStackCancel.stackN,
  //                       withI(_.dragStackCancel, 
  //                             _ => _.stackN)):
  //       Bacon.never();
  //     })
  //     .toEventStream();

  // let esDragStackDropStack = pDragDrop
  //     .flatMap(_ => {
  //       return _.dragStackDropStack?
  //         prependSettleFx(
  //           _.dragStackDropStack.drop.stackN,
  //           withI(_.dragStackDropStack, 
  //                 _ => _.drop.stackN)):
  //         Bacon.never();
  //     }).toEventStream();


  let esDragStackCancel = pDragDrop
      .map(_ => _.base)
      .filter(_ => _.dragStackCancel)
      .map(_ => _.dragStackCancel)
      .flatMap(
        _ => withI(_, _ => _.stackN)

      ).toEventStream();

  let esDragStackCancelWithCards =
      Bacon.when(
        [esDragStackCancel, akdlj, fMergeArgs],
        [esDragStackCancel, fId]);

  let esDragStackDropStack = Bacon.never();

  let esStackDragStart = esDragStackStart;
  let esStackDragCancel = esDragStackCancel;
  let esStackDropStack = esDragStackDropStack;

  let esStackReveal = esStackDropStack
      .map(_ => withI(_.drag, _ => _.stackN));

  let esStackRevealFxBegin = Bacon.never();

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
  

  let essStack = {
    esDealOne2: esDealOne2WithCards,
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
        StackProperty(n, mapToI(essStack, n));

  let pStacks = [
    stackProperty(0),
    stackProperty(1),
    stackProperty(2),
    stackProperty(3),
    stackProperty(4),
    stackProperty(5),
    stackProperty(6),
  ];

  let esDragCards = pStacks.map(pStack =>
    pStack
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .toEventStream()
  ).reduce((acc, _) => acc.merge(_));

  let esDragLive = pDragDrop.map(_ => _.extra)
      .toEventStream();

  const fId = _ => _;
  const fMergeArgs = (_, __) => ({ ..._, ...__ });

  esDragLive = Bacon.when([esDragLive, esDragCards, fMergeArgs],
                         [esDragLive, _ => _]);


  this.pStackN = n => pStacks[n].map(_ => _.base);
  this.pDrawer = pDrawer;
  this.esDragLive = esDragLive;

  this.pFx = name => pFx[name];

  pDrawer.onValue();
  // pHanging.log();
  // pDragDrop.log();

  // Bacon.repeatedly(1000, [true, false]).doAction(_ => {
  //   console.log(_);
  // }).take(0).log();
}

function StackProperty(n, {
  esDealOne2,
  esStackDragCancel,
  esStackDragStart,
  esStackDropStack,
  esStackReveal,
  esStackReveal2
}) {

  let dragStart = (_, { cardN }) => {
    let cards = _.apply(_ => _.cutInProgress(cardN));
    _.add('dragcards', cards);
    return _;
  };

  let dealOne2 = (_, { hidden, cards }) => {
    if (hidden) {
      _.apply(_ => _.hide1(cards));
    } else {
      _.apply(_ => _.add1(cards));
    }
    return _;
  };

  let dragCancel = (_, __) => {
    console.log(__);
    // let cards = hangingState.dragcards;
    // _.add1(cards);
    // _.cutInProgressCommit();
    // _bHanging.remove('dragcards');
    return _;
  };

  let dropStack = (_, __, hangingState) => {
    // let cards = hangingState.dragcards;
    // _.add1(cards);
    // _.cutInProgressCommit();
    // _bHanging.remove('dragcards');
    return _;
  };

  let reveal1 = (_) => {
    if (!_.apply(_.canReveal())) {
      return _;
    }
    let card = _.apply(_.reveal1());
    // _bHanging.update('reveal', {
    //   stackN: n,
    //   card
    // });
    return _;
  };

  let reveal2 = (_, __, hangingState) => {
    // let { card } = hangingState.reveal;
    // _bHanging.remove('reveal');
    // _.add1([card]);
    return _;
  };

  return Bacon.update(new ExtraValues(new SoliStack()),
                      [esDealOne2, dealOne2],
                      [esStackDragCancel, dragCancel],
                      [esStackDropStack, dropStack],
                      [esStackReveal, reveal1],
                      [esStackReveal2, reveal2],
                      [esStackDragStart, dragStart]);
}

function DrawerProperty(esInit,
                        esDealOne1,
                        esDealOne2) {
  let init = (_, cards) => {

    _.apply(_ => _.init(cards));

    return _; };
  let dealOne1 = (_) => { 
    _.applyExtra('dealcards',
                 _ => [_.dealOne1()]);

    // _bHanging.update('deal',
    //                  { cards: [card] });

    return _; };

  let dealOne2 = _ => {
    _.remove('dealcards');
    return _;
  };

  return Bacon.update(new ExtraValues(
    new SoliDrawDeck()
  ),
                      [esInit, init],
                      [esDealOne2, dealOne2],
                      [esDealOne1, dealOne1]);
}

function DragDropProperty(esDrags, esDrops) {

  let esDragStackStart = esDrags
      .filter(_ => _.initial && isN(_.stackN));

  let esDragMove = esDrags
      .filter(_ => !_.initial && !isN(_.stackN));

  let esDropCancel = esDrops
      .filter(_ => !isN(_.stackN));

  let esDropStack = esDrops
      .filter(_ => isN(_.stackN));

  const dragMove = (_, dragMove) => {
    // _bHanging.update('moving', dragMove);
    _.add('moving', dragMove);

    let dragStackStart = _.apply(_ => _.dragStackStart);

    if (dragStackStart) {
      _.set({ dragMove: dragStackStart }); 
    } else if (_.apply(_ => _.dragMove)) {
    } else {
      _.set({});
    }
    return _;
  };

  const dragStackStart = (_, dragStackStart) => {
    // _bHanging.update('dragstart', dragStackStart);
    _.add('dragstart', dragStackStart);


    _.set({
      dragStackStart
    });

    return _;
  };

  const dropBase = _ => {
    _.remove('dragstart');
    _.remove('moving');
    // _bHanging.remove('dragstart');
    // _bHanging.remove('moving');
  };

  const dropCancel = (_, __) => {
    dropBase(_);
    let dragStackMove = _.apply(_ =>
      _.dragStackStart || _.dragMove);

    if (dragStackMove) {
      _.set({
        dragStackCancel: dragStackMove
      });
    } else {
      _.set({});
    }
    return _;
  };

  const dropStack = (_, esDrop) => {
    dropBase(_);
    let dragStackMove = _.apply(_ => 
      _.dragStackStart || _.dragMove);

    if (dragStackMove) {
      _.set({
        dragStackDropStack: { drag: dragStackMove,
                              drop: esDrop }
      });
    } else {
      _.set({});
    }
    return _;
  };

  return Bacon.update
  (new ExtraValues({}), [esDragStackStart, dragStackStart],
   [esDragMove, dragMove],
   [esDropCancel, dropCancel],
   [esDropStack, dropStack]);
  
}

const withExtra = key => _ => _.extra[key];

function ExtraValues(base) {

  let extra = this.extra = {};
  
  this.base = base;

  this.set = value => base = this.base = value;
  this.apply = fn => fn(base);
  this.applyExtra = (key, fn) => this.add(key, fn(base));

  this.add = (key, value) => extra[key] = value;
  this.remove = key => delete extra[key];

};

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

// function HangingBus() {

//   this.b = new Bacon.Bus();

//   this.update = (key, value) => {
//     this.b.push({ update: { key, value } });
//   };
//   this.remove = (key) => {
//     this.b.push({ remove: key });
//   };
// };
