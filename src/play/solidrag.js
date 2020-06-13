import AContainer from './acontainer';

import CardStack from './cardstack';
import * as v from '../vec2';
import { iPolPlus } from './util2';
import { isN } from '../soliutils';

export default function Play(play, ctx, bs) {

  let rsolitaire = play.rsolitaire;

  let solitaire = this.solitaire = play.solitaire;

  let dDragStack = new CardStack(this, ctx, {
    onBeginCard() {
      // solitaire.userActionDoubleTapStack();
    },
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dDragStack);
  };
  initContainer();

  // this.solitaire.bSelection.subscribe(({ cards }) => {
  //   dDragStack.init({ stack: cards });
  //   dDragStack.highlight(true);
  // });

  // this.solitaire.aSelection.subscribe(({ active, epos, decay }) => {
  //   if (!active) {
  //     return;
  //   }
  //   dDragStack.container.move(epos[0] + decay[0],
  //                             epos[1] + decay[1]);
  // });

  // let settleSource,
  //     settleTargetDiff;
  // let iSettle = new iPolPlus({
  //   onBegin(oSettle) {

  //     let { drawN, stackN, holeN } = oSettle;

  //     let settleTarget;

  //     settleSource = dDragStack.container.globalPosition();

  //     if (isN(stackN)) {
  //       let dStack = play.dStackN(stackN);
  //       settleTarget = dStack.nextCardGlobalPosition();
  //     } else if (isN(drawN)) {
  //       settleTarget = play.dDraw.showGlobalPosition();
  //     } else if (isN(holeN)) {
  //       let dHole = play.dHoleN(holeN);
  //       settleTarget = dHole.nextCardGlobalPosition();
  //     }

  //     settleTargetDiff = [settleTarget[0] - settleSource.x,
  //                         settleTarget[1] - settleSource.y];
  //   },
  //   onUpdate(_, i) {
  //     let vSettleTarget = v.cscale(settleTargetDiff, i);
  //     dDragStack.container.move(settleSource.x + vSettleTarget[0],
  //                               settleSource.y + vSettleTarget[1]);
  //   }
  // });

  // this.solitaire.fx('settle').subscribe({
  //   onBegin(oSettle, resolve) {
  //     iSettle.begin(oSettle, resolve);
  //   },
  //   onEnd() {
  //     dDragStack.init({ stack: [] });
  //   }
  // });


  this.init = (data) => {
    listenSolitaire();
  };
  

  this.update = delta => {
    // iSettle.update(delta / 200);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  const initDrag = (cards, { epos, decay }) => {
    dDragStack.init({ stack: cards });
    dDragStack.highlight(true);    
    dDragStack.container.move(epos[0] + decay[0],
                              epos[1] + decay[1]);
  };

  const moveDrag = ({ decay }, { epos }) => {
    dDragStack.container.move(epos[0] + decay[0],
                              epos[1] + decay[1]);
  };

  const endDrag = () => {
    dDragStack.init({ stack: [] });
  };

  const listenSolitaire = () => {
    
    rsolitaire().pHanging.onValue(hanging => {
      let { drag, cards, start, moving } = hanging;

      if (drag && !moving && cards) {
        initDrag(cards, start);
      } else if (drag && moving) {
        moveDrag(start, moving);
      } else {
        endDrag();
      }
    });

  };
}
