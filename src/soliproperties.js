import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';
import { ExtraValues } from './rutils';
import * as Bacon from 'baconjs';

import SoliDrag from './solidrag';

export function DragDropProperty(esDrags, esDrops) {

  let esDragEmptyStart = esDrags.filter(_ => _.initial && 
                                        !_.drawN &&
                                        !isN(_.stackN));

  let esDragDrawStart = esDrags
      .filter(_ => _.initial && _.drawN);

  let esDragStackStart = esDrags
      .filter(_ => _.initial && 
              isN(_.stackN));

  let esDragHoleStart = esDrags
      .filter(_ => _.initial && 
              isN(_.holeN));

  let esDragMove = esDrags
      .filter(_ => !_.initial);

  let esDropCancel = esDrops
      .filter(_ => !isN(_.stackN) &&
              !isN(_.holeN));

  let esDropStack = esDrops
      .filter(_ => isN(_.stackN));

  let esDropHole = esDrops
      .filter(_ => isN(_.holeN));

  const dragMove = (_, dragMove) => {
    _.add('moving', dragMove);
    _.apply(_ => _.moving());

    return _;
  };

  const dragEmptyStart = (_) => {
    _.apply(_ => 
      _.dragEmptyStart());

    return _;
  };

  const dragHoleStart = (_, dragHoleStart) => {
    _.add('dragstart', dragHoleStart);

    _.apply(_ => 
      _.dragHoleStart(dragHoleStart));

    return _;
  };

  const dragStackStart = (_, dragStackStart) => {
    _.add('dragstart', dragStackStart);

    _.apply(_ => 
      _.dragStackStart(dragStackStart));

    return _;
  };

  const dragDrawStart = (_, dragDrawStart) => {
    _.add('dragstart', dragDrawStart);

    _.apply(_ => 
      _.dragDrawStart(dragDrawStart));

    return _;
  };

  const dropBase = _ => {
    _.remove('dragstart');
    _.remove('moving');
  };

  const dropCancel = (_, __) => {
    dropBase(_);

    _.apply(_ => _.dropCancel());

    return _;
  };

  const dropStack = (_, drop) => {
    dropBase(_);

    _.apply(_ => _.dropStack(drop));

    return _;
  };

  const dropHole = (_, drop) => {
    dropBase(_);

    _.apply(_ => _.dropHole(drop));

    return _;    
  };

  return Bacon.update
  (new ExtraValues(new SoliDrag()),
   [esDragEmptyStart, dragEmptyStart],
   [esDragStackStart, dragStackStart],
   [esDragDrawStart, dragDrawStart],
   [esDragHoleStart, dragHoleStart],
   [esDragMove, dragMove],
   [esDropCancel, dropCancel],
   [esDropHole, dropHole],
   [esDropStack, dropStack]);
  
}

export function HoleProperty(n, {
  esDragStart,
  esDragCancel,
  esDropHole,
}) {
  let dragStart = _ => {
    let cards = _.apply(_ => [_.remove()]);
    _.add('dragcards', cards);
    return _;
  };

  let dragCancel = (_, { dragcards }) => {
    let cards = dragcards[0];
    _.apply(_ => {
      _.add(cards);
    });
    _.remove('dragcards');
    return _;
  };

  let dropHole = (_, { dragcards }) => {
    let card = dragcards[0];
    _.apply(_ => _.add(card));
    return _;
  };


  return Bacon.update
  (new ExtraValues(new SoliHole()),
   [esDropHole, dropHole],
   [esDragStart, dragStart],
   [esDragCancel, dragCancel]
  );
}

export function StackProperty(n, {
  esRefresh,
  esInit,
  esStackDeal,
  esStackDragCancel,
  esStackDragStart,
  esStackDropStack,
  esStackReveal,
  esStackReveal2
}) {

  let init = _ => {
    return _;
  };

  let refresh = _ => {
    return _;
  };

  let dragStart = (_, { cardN }) => {
    let cards = _.apply(_ => _.cutInProgress(cardN));
    _.add('dragcards', cards);
    return _;
  };

  let deal = (_, { hidden, cards }) => {
    if (hidden) {
      _.apply(_ => _.hide1(cards));
    } else {
      _.apply(_ => _.add1(cards));
    }
    return _;
  };

  let dragCancel = (_, { dragcards }) => {
    let cards = dragcards;
    _.apply(_ => {
      _.add1(cards);
      _.cutInProgressCommit();
    });
    _.remove('dragcards');
    return _;
  };

  let dropStack = (_, { dragcards }) => {
    let cards = dragcards;
    _.apply(_ => {
      _.add1(cards);
    });
    _.remove('dragcards');
    return _;
  };

  let reveal1 = (_) => {
    _.apply(_ => _.cutInProgressCommit());

    if (!_.apply(_ => _.canReveal())) {
      return _;
    }
    let card = _.apply(_ => _.reveal1());
    _.add('reveal', { stackN: n, card });
    return _;
  };

  let reveal2 = (_, reveal) => {
    let { card } = reveal;
    _.remove('reveal');
    _.apply(_ => {
      _.add1([card]);
    });
    return _;
  };

  return Bacon.update(new ExtraValues(new SoliStack()),
                      [esInit, init],
                      [esRefresh, refresh],
                      [esStackDeal, deal],
                      [esStackDragCancel, dragCancel],
                      [esStackDropStack, dropStack],
                      [esStackReveal, reveal1],
                      [esStackReveal2, reveal2],
                      [esStackDragStart, dragStart]);
}

export function DrawerProperty({
  esInit,
  esDealStack1,
  esDealStack2,
  esDeal,
  esShuffle,
  esDragStart,
  esDragCancel,
  esDragDrop
}) {
  let init = (_, cards) => {

    _.apply(_ => _.init(cards));

    return _; };

  let dealStack1 = (_) => { 
    _.applyExtra('dealcards',
                 _ => [_.dealOne1()]);

    return _; };

  let dealStack2 = _ => {
    _.remove('dealcards');
    return _;
  };

  let dealOne = _ => {
    _.apply(_ => _.dealOne12());
    return _;
  };

  let shuffle = _ => {
    _.apply(_ => {
      let cards = _.shuffle1();
      _.shuffle2(cards);
    });
    return _;    
  };

  let dragStart = _ => {
    let cards = _.apply(_ => [_.draw1()]);
    _.add('dragcards', cards);
    return _;
  };

  let dragCancel = (_, { dragcards }) => {
    let cards = dragcards;
    _.apply(_ => {
      _.drawCancel1(cards[0]);
    });
    _.remove('dragcards');
    return _;
  };

  let dragDrop = (_) => {
    _.apply(_ => {
      _.drawCommit1();
    });
    _.remove('dragcards');
    return _;
  };

  return Bacon.update(new ExtraValues(
    new SoliDrawDeck()
  ),
                      [esInit, init],
                      [esDeal, dealOne],
                      [esShuffle, shuffle],
                      [esDragStart, dragStart],
                      [esDragCancel, dragCancel],
                      [esDragDrop, dragDrop],
                      [esDealStack2, dealStack2],
                      [esDealStack1, dealStack1]);
}
