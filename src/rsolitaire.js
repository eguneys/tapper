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

import { PSelectProperty, PSelectValue } from './solipselect';

import RSoliDealer from './rsolidealer';

const fId = _ => _;
const fMergeArgs = (_, __) => ({ ..._, ...__ });
const fMergeStreams = (acc, _) => acc.merge(_);

const withI = (obj, pullI) => ({
  i: pullI(obj),
  ...obj
});

export default function RSolitaire({ 
  esStarts,
  esClicks,
  esDrags, 
  esDrops,
  esDrawDeals,
  esDrawShuffle }) {

  let esStartsStack = esStarts
      .filter(_ => isN(_.stackN))
      .map(_ => ({
        stackN: _.stackN,
        cardN: _.cardN
      }));


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


  /*
   * Bus Stack
   */
  let bStacks = stackPlate.map(_ => new SyncBus());

  let bStackN = n => bStacks[n].bus;

  let pStacksEarly = bStacks
      .map(_ => _.bus.toProperty());

  let pStackNEarly = n => pStacksEarly[n];

  let pDragCardsEarly = bStacks.map(bStack =>
    bStack
      .bus
      .map(_ => _.extra)
      .filter(_ => _.dragcards)
      .map(_ => ({ dragcards: _.dragcards }))
      .toEventStream()
  ).reduce(fMergeStreams)
      .toProperty();

  /*
   * Persist Select Bus
   */

  let bPersistSelect = new SyncBus();

  /*
   * Clicks
   */
  let esCancelClicks = esClicks
      .filter(_ => !isN(_.stackN) &&
              !_.drawN &&
              !isN(_.holeN));

  let esStackClicks = esClicks
      .filter(_ => isN(_.stackN));

  let esDrawClicks = esClicks
      .filter(_ => isN(_.drawN));

  let esHoleClicks = esClicks
      .filter(_ => isN(_.holeN));

  /*
   *  Stack Highlight
   */
  let esStackHighlightCardN = bPersistSelect
      .bus
      .filter(_ => _.value())
      .map(_ => _.value())
      .filter(_ => isN(_.stackN))
      .map(_ => withI(_, _ => _.stackN))
      .toEventStream();

  let esStackRemoveHighlight = bPersistSelect
      .bus
      .filter(_ => _.previous())
      .map(_ => _.previous())
      .filter(_ => isN(_.stackN))
      .map(_ => withI(_, _ => _.stackN))
      .toEventStream();

  /*
   *  Draw Highlight
   */
  let esDrawHighlight = bPersistSelect
      .bus
      .filter(_ => _.value())
      .map(_ => _.value())
      .filter(_ => _.drawN)
      .toEventStream();

  let esDrawRemoveHighlight = bPersistSelect
      .bus
      .filter(_ => _.previous())
      .map(_ => _.previous())
      .filter(_ => _.drawN)
      .toEventStream();

  /*
   * Hole Highlight
   */

  let esHoleHighlight = bPersistSelect
      .bus
      .filter(_ => _.value())
      .map(_ => _.value())
      .filter(_ => isN(_.holeN))
      .map(_ => withI(_, _ => _.holeN))
      .toEventStream();

  let esHoleRemoveHighlight = bPersistSelect
      .bus
      .filter(_ => _.previous())
      .map(_ => _.previous())
      .filter(_ => isN(_.holeN))
      .map(_ => withI(_, _ => _.holeN))
      .toEventStream();

  /*
   * Draw Drag Cancel
   */

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
   * Draw Drag Drop Stack
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
   * Draw Drag Drop Hole
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
    esHighlight: esDrawHighlight,
    esRemoveHighlight: esDrawRemoveHighlight,
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


  /*
   * Move Persist Select
   */

  const makeEsMoveCards =
        (src, dst) => {

          let { stackN: srcStackN,
                cardN: srcCardN } = src;

          let { stackN: dstStackN } = dst;

          return Bacon.once({ 
            moveCut: withI(src, _ => _.stackN) })
            .concat(Bacon.once({
              moveAdd: withI(dst, _ => _.stackN)
            }));
         };

  let pMovePersistSelectStack = 
      esStartsStack.flatMap(startStack => {
        let es = Bacon.combineWith(bPersistSelect, fId)
            .flatMap(persistSelect => {
              return makeEsMoveCards(persistSelect, startStack);
            });

        return es;
      });

  let esMoveStackDragStart = pMovePersistSelectStack
      .filter(_ => _.moveAdd)
      .map(_ => _.moveAdd)
      .toEventStream()
      .log();

  let esMoveStackDrop = pMovePersistSelectStack
      .filter(_ => _.moveCut)
      .map(_ => _.moveCut)
      .toEventStream();


  let esMoveStackDropWithCards =
      Bacon.when([esMoveStackDrop, 
                  pDragCardsEarly,
                  fMergeArgs]);

  /*
   * Drag Stack Start
   */
  let esDragStackStart = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.drag && _.drag.stack && _.initial)
      .map(_ => _.drag.stack)
      .map(_ => 
        withI(_,
              _ => _.stackN))
      .toEventStream();

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

  let esTDragStackDropStack = pDragDrop
      .map(_ => _.base)
      .map(_ => _.state())
      .filter(_ => _.dropstack)
      .map(_ => _.dropstack)
      .filter(_ => _.drag.stack)
      .flatMap(_ => {

        let pDropStack = pStackNEarly(_.drop.stackN)
            .map(_ => _.base);

        let es = pDropStack
            .zip(pDragCardsEarly, (stack, { dragcards }) => {
              // TODO add rules
              return true;
              return stack.canAdd(dragcards);
            })
            .take(1)
            .flatMap(canAdd => {
              if (canAdd) {
                return makeFxTween({ stackN: _.drop.stackN }, 100,
                                   { drop: true})
                  .concat(
                    Bacon.once({ 
                      action: withI(_,
                                    _ => _.drop.stackN) }));

              } else {
                return makeFxTween({ 
                  stackN: _.drag.stack.stackN
                }, 100, { cancel: true })
                  .concat(
                    Bacon.once({ 
                      cancel: withI(_,
                                    _ => _.drag.stack.stackN)
                    }));
              }
            });

        return Bacon.once({ droprefresh: 
                            withI({}, __ => _.drop.stackN) })
          .concat(es);
      }).toEventStream();

  let esDragStackDropRefresh = esTDragStackDropStack
      .filter(_ => _.droprefresh)
      .map(_ => _.droprefresh);

  let esDragStackDropStackCancel = esTDragStackDropStack
      .filter(_ => _.cancel)
      .map(_ => _.cancel);

  let esDragStackDropStackSettleTween = esTDragStackDropStack
      .filter(_ => _.tween && _.drop)
      .map(_ => _.tween);

  let esDragStackDropStackCancelSettleTween = esTDragStackDropStack
      .filter(_ => _.tween && _.cancel)
      .map(_ => _.tween);


  let esDragStackDropStack = esTDragStackDropStack
      .filter(_ => _.action)
      .map(_ => _.action);

  let esDragStackDropStackWithCards =
      Bacon.when([esDragStackDropStack, 
                  pDragCardsEarly,
                  fMergeArgs]);

  // wrong
  // let esDragStackCancelWithCards =
  //     esDragStackCancel.zip(esDragCardsEarly, fMergeArgs);

  let esDragStackCancelWithCards =
      Bacon.when(
        [esDragStackDropStackCancel, pDragCardsEarly, fMergeArgs],
        [esDragStackCancel, pDragCardsEarly, fMergeArgs]);

  let esStackDragStart = [
    esDragStackStart,
    // esMoveStackDragStart
  ].reduce(fMergeStreams);
  let esStackDragCancel = esDragStackCancelWithCards;
  let esStackDropStack = [
    esMoveStackDropWithCards,
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
   * Stack Remove Drag Cards
   */

  let esStackRemoveDragCards = [
    esDragStackDropHole,
    esDragStackDropStack,
    esDragStackCancel,
    esDragStackDropStackCancel
  ].reduce(fMergeStreams);

  /*
   * Stack Reveal
   */

  let esStackRevealCandidate = [
    esDragStackDropStackWithCards,
    esDragStackDropHoleWithCards
  ]
      .reduce(fMergeStreams)
      .map(_ => withI(_.drag.stack, _ => _.stackN));

  let esTStackReveal = esStackRevealCandidate.flatMap(_ => {
    
    let pRevealStack = pStackNEarly(_.i)
        .map(_ => _.base);

    let es = pRevealStack
        .map(_ => _.canRevealCard())
        .take(1)
        .flatMap(canReveal => {
          if (canReveal) {
            return Bacon.once({ reveal1: _ })
              .concat(
                makeFxTween({ ..._, card: canReveal }, 200)
                  .concat(
                    Bacon.once({ reveal2: _ })
                  )
              );
          } else {
            return Bacon.never();
          }
        });

    return Bacon.once({ revealrefresh: _ })
      .concat(es);
  });

  let esStackReveal = esTStackReveal
      .filter(_ => _.reveal1)
      .map(_ => _.reveal1);

  let esRevealStack2 = esTStackReveal
      .filter(_ => _.reveal2)
      .map(_ => _.reveal2);

  let esRevealStackTween = esTStackReveal
      .filter(_ => _.tween)
      .map(_ => _.tween);

  let esStackReveal2 = esRevealStack2;

  let esStackRefresh = [
    esDragStackDropRefresh
  ].reduce(fMergeStreams);

  const demuxStacks = es => es.flatMap(_ => {
    return stackPlate
      .map(i => Bacon.once(withI({ cards: _ }, _ => i)))
      .reduce(fMergeStreams);
  });

  let essStack = {
    esInit: demuxStacks(esInit),
    esRefresh: esStackRefresh,
    esRemoveDragCards: demuxStacks(esStackRemoveDragCards),
    esHighlightCardN: esStackHighlightCardN,
    esRemoveHighlight: esStackRemoveHighlight,
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

  /*
   *  Drag Hole Start
   */

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
    esHighlight: esHoleHighlight,
    esRemoveHighlight: esHoleRemoveHighlight,
    esDragStart: esHoleDragStart,
    esDragCancel: esHoleDragCancel,
    esDropHole: esHoleDropHole,
  };


  const holeProperty = n =>
        HoleProperty(n, mapToI(essHole, n));
  
  let pHoles = holePlate.map(_ => holeProperty(_));

  pHoles.map((_, i) => bHoles[i].assign(_));

  // pHoles[0].map(_ => _.extra).log();

  /*
   *  Drag Live
   */

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


  /*
   * All Drag Starts
   */

  let esAllDragStarts = [
    esDrawDragStart,
    esHoleDragStart,
    esStackDragStart
  ].reduce(fMergeStreams);

  /*
   * Persist Select
   */

  let esPersistSelectStack = esStackClicks
      .map(_ => new PSelectValue({
        stackN: _.stackN,
        cardN: _.cardN
      }));

  let esPersistSelectDraw = esDrawClicks
      .map(_ => new PSelectValue({
        drawN: true
      }));

  let esPersistSelectHole = esHoleClicks
      .map(_ => new PSelectValue({
        holeN: _.holeN
      }));

  let esPersistSelect = 
      [esPersistSelectStack,
       esPersistSelectDraw,
       esPersistSelectHole
      ].reduce(fMergeStreams);

  const fFalse = _ => false;

  esPersistSelect = Bacon.when(
    [esPersistSelect, esMoveStackDragStart, fId],
    [esPersistSelect, fFalse]).filter(Boolean).log();

  let esPersistDeselect = [
    esCancelClicks,
    esAllDragStarts
  ].reduce(fMergeStreams);

  let pPersistSelect = PSelectProperty(esPersistSelect,
                                       esPersistDeselect);

  bPersistSelect.assign(pPersistSelect);


  /*
   *  Exports
   */
  this.pPSelect = pPersistSelect;
  this.pHoleN = n => pHoles[n].map(_ => _.base);
  this.pStackN = n => pStacks[n].map(_ => _.base);
  this.pDrawer = pDrawer.map(_ => _.base);
  this.esDragLive = esDragLive;

  this.pHoleHighlightN = n => pHoles[n]
    .map(_ => _.extra)
    .map(_ => _.highlight);

  this.pStackHighlightN = n => pStacks[n]
    .map(_ => _.extra)
    .map(_ => _.highlight);

  this.pDrawerHighlight = pDrawer
    .map(_ => _.extra)
    .map(_ => _.highlight);

  let esTweenSettle = [
    esDragStackDropStackCancelSettleTween,
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
