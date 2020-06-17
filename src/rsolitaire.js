import { objMap } from './util2';
import * as Bacon from 'baconjs';

import { makeFxTween } from './rfx';

import { makeOneDeck } from './deck';
import { isN, stackPlate, holePlate } from './soliutils';

import { SyncBus, ExtraValues } from './rutils';
import { DragDropProperty, 
         DrawerProperty,
         StackProperty,
         HoleProperty
       } from './soliproperties';

import RSoliDealer from './rsolidealer';

const fId = _ => _;
const fMergeArgs = (_, __) => ({ ..._, ...__ });
const fMergeStreams = (acc, _) => acc.merge(_);

const withI = (obj, pullI) => ({
  i: pullI(obj),
  ...obj
});

export default function RSolitaire({ esDrags, 
                                     esDrops,
                                     esDrawDeals,
                                     esDrawShuffle }) {

  let pDragDrop = DragDropProperty(esDrags, esDrops);
  
  let deck = makeOneDeck();

  const makeEsDealer = () => RSoliDealer();

  let esUserInit = Bacon.once(true);

  let esInit = esUserInit.doAction(_ => {
    deck.shuffle();
  }).map(_ => deck.drawRest());

  let esDealCards = esInit
      .flatMapLatest(_ => makeEsDealer());

  let esDealOne = esDealCards.flatMapConcat(_ => 
    Bacon.once({ dealStack1: true, ..._ })
      .concat(makeFxTween(_, 10))
      .concat(Bacon.once({ dealStack2: true, ..._ }))
  );

  let esDealStack1 = esDealOne.filter(_ => _.dealStack1);
  let esDealStack2 = esDealOne.filter(_ => _.dealStack2);

  let esDrawDeal = esDrawDeals;

  let esDragDrawStart = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.drag && _.drag.draw && _.initial)
      .map(_ => _.drag.draw)
      .toEventStream();

  let esDrawDragStart = esDragDrawStart;

  let bDrawer = new SyncBus();


  let esTDragDrawCancel = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.cancel && _.cancel.draw)
      .map(_ => _.cancel.draw)
      .flatMap(_ => 
        makeFxTween({ drawN: true }, 100)
          .concat(
            Bacon.once({ action: _.drawN }))
      ).toEventStream();

  let esDragDrawCancelSettleTween = esTDragDrawCancel
      .filter(_ => _.tween)
      .map(_ => _.tween);


  let esDragDrawCancel = esTDragDrawCancel
      .filter(_ => _.action)
      .map(_ => _.action);  


  let pDragCardsDrawEarly = bDrawer
      .bus
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .map(_ => ({ dragcards: _.dragcards }))
      .toProperty();

  let esDragDrawCancelWithCards =
      Bacon.when(
        [esDragDrawCancel, pDragCardsDrawEarly, fMergeArgs]);

  let esDrawDragCancel = esDragDrawCancelWithCards;

  /*
   * Drag Draw Drop Stack
   */
  let esTDragDrawDropStack = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.dropstack)
      .map(_ => _.dropstack)
      .filter(_ => _.drag.draw)
      .flatMap(_ => 
        makeFxTween({ stackN: _.drop.stackN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.drop.stackN) }))
      ).toEventStream();

  let esDragDrawDropStackSettleTween = esTDragDrawDropStack
      .filter(_ => _.tween)
      .map(_ => _.tween);


  let esDragDrawDropStack = esTDragDrawDropStack
      .filter(_ => _.action)
      .map(_ => _.action);

  let esDragDrawDropStackWithCards =
      Bacon.when([esDragDrawDropStack, 
                  pDragCardsDrawEarly,
                  fMergeArgs]);


  /*
   * Drag Draw Drop Hole
   */
  let esTDragDrawDropHole = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.drophole)
      .map(_ => _.drophole)
      .filter(_ => _.drag.draw)
      .flatMap(_ => 
        makeFxTween({ holeN: _.drop.holeN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.drop.holeN) }))
      ).toEventStream();

  let esDragDrawDropHoleSettleTween = esTDragDrawDropHole
      .filter(_ => _.tween)
      .map(_ => _.tween);


  let esDragDrawDropHole = esTDragDrawDropHole
      .filter(_ => _.action)
      .map(_ => _.action);

  let esDragDrawDropHoleWithCards =
      Bacon.when([esDragDrawDropHole, 
                  pDragCardsDrawEarly,
                  fMergeArgs]);


  let esDrawDragDrop = [esDragDrawDropStack,
                        esDragDrawDropHole]
      .reduce(fMergeStreams);

  let pDrawer = DrawerProperty({
    esInit, 
    esDealStack1,
    esDealStack2,
    esShuffle: esDrawShuffle,
    esDeal: esDrawDeal,
    esDragStart: esDrawDragStart,
    esDragCancel: esDrawDragCancel,
    esDragDrop: esDrawDragDrop
  });

  bDrawer.assign(pDrawer);


  /*
   * Bus Hole
   */
  let bHoles = holePlate.map(_ => new SyncBus());

  let pDragCardsHoleEarly = bHoles.map(bHole =>
    bHole
      .bus
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .map(_ => ({ dragcards: _.dragcards }))
      .toEventStream()
  ).reduce(fMergeStreams)
      .toProperty();

  /*
   * Drag Hole Drop Stack
   */
    let esTDragHoleDropStack = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.dropstack)
      .map(_ => _.dropstack)
      .filter(_ => _.drag.hole)
      .flatMap(_ => 
        makeFxTween({ stackN: _.drop.stackN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.drop.stackN) }))
      ).toEventStream();

  let esDragHoleDropStackSettleTween = esTDragHoleDropStack
      .filter(_ => _.tween)
      .map(_ => _.tween);


  let esDragHoleDropStack = esTDragHoleDropStack
      .filter(_ => _.action)
      .map(_ => _.action);

  let esDragHoleDropStackWithCards =
      Bacon.when([esDragHoleDropStack, 
                  pDragCardsHoleEarly,
                  fMergeArgs]);
  
  let esDealStack2WithCards = 
      esDealStack2.zip(pDrawer
                       .map(_ => _.extra)
                       .filter(_ => _.dealcards)
                       .map(_ => _.dealcards),
                       (_, cards) => ({ cards, ..._ }));

  let esDragStackStart = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.drag && _.drag.stack && _.initial)
      .map(_ => _.drag.stack)
      .map(_ => 
        withI(_,
              _ => _.stackN))
      .toEventStream();

  let bStacks = stackPlate.map(_ => new SyncBus());

  let bStackN = n => bStacks[n].bus;

  let pDragCardsEarly = bStacks.map(bStack =>
    bStack
      .bus
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .map(_ => ({ dragcards: _.dragcards }))
      .toEventStream()
  ).reduce(fMergeStreams)
      .toProperty();

  let esTDragStackCancel = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.cancel && _.cancel.stack)
      .map(_ => _.cancel.stack)
      .flatMap(_ =>
        makeFxTween({ stackN: _.stackN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.stackN) }))
      ).toEventStream();

  let esDragStackCancelSettleTween = esTDragStackCancel
      .filter(_ => _.tween)
      .map(_ => _.tween);

  let esDragStackCancel = esTDragStackCancel
      .filter(_ => _.action)
      .map(_ => _.action);

  // wrong
  // let esDragStackCancelWithCards =
  //     esDragStackCancel.zip(esDragCardsEarly, fMergeArgs);

  let esDragStackCancelWithCards =
      Bacon.when(
        [esDragStackCancel, pDragCardsEarly, fMergeArgs]);

  let esTDragStackDropStack = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.dropstack)
      .map(_ => _.dropstack)
      .filter(_ => _.drag.stack)
      .flatMap(_ => {
        
        return makeFxTween({ stackN: _.drop.stackN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.drop.stackN) }));
      }).toEventStream();

  let esDragStackDropStackSettleTween = esTDragStackDropStack
      .filter(_ => _.tween)
      .map(_ => _.tween);


  let esDragStackDropStack = esTDragStackDropStack
      .filter(_ => _.action)
      .map(_ => _.action);

  let esDragStackDropStackWithCards =
      Bacon.when([esDragStackDropStack, 
                  pDragCardsEarly,
                  fMergeArgs]);

  let esStackDragStart = esDragStackStart;
  let esStackDragCancel = esDragStackCancelWithCards;
  let esStackDropStack = [
    esDragStackDropStackWithCards,
    esDragDrawDropStackWithCards,
    esDragHoleDropStackWithCards
  ].reduce(fMergeStreams);


  /* 
   * Drag Stack Drop Hole
   */
  let esTDragStackDropHole = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.drophole)
      .map(_ => _.drophole)
      .filter(_ => _.drag.stack)
      .flatMap(_ => 
        makeFxTween({ holeN: _.drop.holeN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.drop.holeN) }))
      ).toEventStream();

  let esDragStackDropHoleSettleTween = esTDragStackDropHole
      .filter(_ => _.tween)
      .map(_ => _.tween);


  let esDragStackDropHole = esTDragStackDropHole
      .filter(_ => _.action)
      .map(_ => _.action);


  let esDragStackDropHoleWithCards =
      Bacon.when([esDragStackDropHole,
                  pDragCardsEarly,
                  fMergeArgs]);


  /*
   * Stack Reveal
   */

  let esStackReveal = [
    esDragStackDropStackWithCards,
    esDragStackDropHoleWithCards
  ]
      .reduce(fMergeStreams)
      .map(_ => withI(_.drag.stack, _ => _.stackN));

  let esExtraRevealEarly = bStacks.map(bStack =>
    bStack
      .bus
      .map(_ => _.extra)
      .filter(_ => _.reveal)
      .map(_ => _.reveal)
      .toEventStream()
  ).reduce(fMergeStreams)
      .toProperty();

  let esTRevealStack2 = esExtraRevealEarly
      .flatMap(_ => 
        makeFxTween(_, 200)
          .concat(
            Bacon.once({ action: withI(_, _ => _.stackN) }))
      ).toEventStream();

  let esRevealStack2 = esTRevealStack2
      .filter(_ => _.action)
      .map(_ => _.action);

  let esRevealStackTween = esTRevealStack2
      .filter(_ => _.tween)
      .map(_ => _.tween);

  let esStackReveal2 = esRevealStack2;

  let essStack = {
    esStackDeal: esDealStack2WithCards,
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

  let pStacks = stackPlate.map(_ => stackProperty(_));

  pStacks.map((_, i) => bStacks[i].assign(_));

  /*
   * Drag Hole Cancel
   */
  let esTDragHoleCancel = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.cancel && _.cancel.hole)
      .map(_ => _.cancel.hole)
      .flatMap(_ =>
        makeFxTween({ holeN: _.holeN }, 100)
          .concat(
            Bacon.once({ action: withI(_, _ => _.holeN) }))
      ).toEventStream();

  let esDragHoleSettleTween = esTDragHoleCancel
      .filter(_ => _.tween)
      .map(_ => _.tween);

  let esDragHoleCancel = esTDragHoleCancel
      .filter(_ => _.action)
      .map(_ => _.action);

  let esDragHoleCancelWithCards =
      Bacon.when([esDragHoleCancel, 
                  pDragCardsHoleEarly,
                  fMergeArgs]);

  let esHoleDragStart = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.drag && _.drag.hole && _.initial)
      .map(_ => _.drag.hole)
      .map(_ => 
        withI(_,
              _ => _.holeN))
      .toEventStream();
  
  let esHoleDragCancel = esDragHoleCancelWithCards;

  let esHoleDropHole = [
    esDragDrawDropHoleWithCards,
    esDragStackDropHoleWithCards
  ].reduce(fMergeStreams);

  let essHole = {
    esDragStart: esHoleDragStart,
    esDragCancel: esHoleDragCancel,
    esDropHole: esHoleDropHole,
  };


  const holeProperty = n =>
        HoleProperty(n, mapToI(essHole, n));
  
  let pHoles = holePlate.map(_ => holeProperty(_));

  pHoles.map((_, i) => bHoles[i].assign(_));

  let esDragCardsStack = pStacks.map(pStack =>
    pStack
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .toEventStream()
  ).reduce(fMergeStreams);

  let esDragCardsDraw = pDrawer
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .toEventStream();

  let esDragCardsHole = pHoles.map(pHole =>
    pHole
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .toEventStream()
  ).reduce(fMergeStreams);

  let pDragCards = [esDragCardsStack,
                    esDragCardsHole,
                    esDragCardsDraw]
      .reduce(fMergeStreams)
      .toProperty();

  let esDragLive = pDragDrop.map(_ => _.extra)
      .toEventStream();

  esDragLive = Bacon.when([esDragLive, 
                           pDragCards,
                           fMergeArgs]);

  this.pHoleN = n => pHoles[n].map(_ => _.base);
  this.pStackN = n => pStacks[n].map(_ => _.base);
  this.pDrawer = pDrawer.map(_ => _.base);
  this.esDragLive = esDragLive;

  let esTweenSettle = [
    esDragHoleSettleTween,
    esDragHoleDropStackSettleTween,
    esDragDrawDropHoleSettleTween,
    esDragStackDropHoleSettleTween,
    esDragDrawCancelSettleTween,
    esDragDrawDropStackSettleTween,
    esDragStackCancelSettleTween,
    esDragStackDropStackSettleTween]
      .reduce(fMergeStreams);

  let esTweenReveal = esRevealStackTween;

  this.esTweens = {
    'settle': esTweenSettle,
    'reveal': esTweenReveal
  };

  // pDrawer.onValue();
  // pDragDrop
  //   .map(_ => _.base)
  //   .map(_ => _.state())
  //   .log();

  // Bacon.repeatedly(1000, [true, false]).doAction(_ => {
  //   console.log(_);
  // }).take(0).log();
}
