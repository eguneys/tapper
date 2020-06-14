import AContainer from './acontainer';

import CardStack from './cardstack';
import * as v from '../vec2';
import { iPolPlus } from './util2';
import { isN, isUndefined } from '../soliutils';

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
  };

  let settleSource,
      settleTargetDiff;
  const beginSettle = (oSettle) => {
    let { drawN, stackN, holeN } = oSettle;

      let settleTarget;

      settleSource = dDragStack.container.globalPosition();

      if (isN(stackN)) {
        let dStack = play.dStackN(stackN);
        settleTarget = dStack.nextCardGlobalPosition();
      } else if (isN(drawN)) {
        settleTarget = play.dDraw.showGlobalPosition();
      } else if (isN(holeN)) {
        let dHole = play.dHoleN(holeN);
        settleTarget = dHole.nextCardGlobalPosition();
      }

      settleTargetDiff = [settleTarget[0] - settleSource.x,
                          settleTarget[1] - settleSource.y];
  };

  const updateSettle = (i) => {
    let vSettleTarget = v.cscale(settleTargetDiff, i);
    dDragStack.container.move(settleSource.x + vSettleTarget[0],
                              settleSource.y + vSettleTarget[1]);
  };

  const endSettle = () => {
    dDragStack.init({ stack: [] });
  };

  const listenSolitaire = () => {
    
    rsolitaire().pFx('settle').onValue(_settle => {
      let { settle } = _settle;

      if (!settle) {
        endSettle();
        return;
      }

      let { i, oSettle } = settle;

      if (oSettle && isUndefined(i)) {
        beginSettle(oSettle);
      } else if (!isUndefined(i)) {
        updateSettle(i);
      }

    });

    rsolitaire().esDragLive.onValue(hanging => {
      let { dragstart, dragcards, moving } = hanging;

      if (dragstart && !moving && dragcards) {
        initDrag(dragcards, dragstart);
      } else if (dragstart && moving) {
        moveDrag(dragstart, moving);
      } else {
        endDrag();
      }
    });

  };
}
