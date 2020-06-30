import AContainer from './acontainer';

import CardStack from './cardstack';
import { iPolPlus } from './util2';
import * as v from '../vec2';

export default function Play(play, ctx, bs) {

  let dDragStack = new CardStack(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dDragStack);
  };
  initContainer();

  let settleSource,
      settleTargetDiff;
  let iSettle = new iPolPlus({
    onBegin(settleTarget) {

      settleSource = dDragStack.container.globalPosition();

      settleTargetDiff = 
        [settleTarget[0] - settleSource.x,
         settleTarget[1] - settleSource.y];
    },
    onUpdate(_, i) {
      let vSettleTarget = v
          .cscale(settleTargetDiff, i);

      dDragStack.container
        .move(settleSource.x + vSettleTarget[0],
              settleSource.y + vSettleTarget[1]);
    }
  });

  this.beginDrag = (cards) => {
    dDragStack.init({ stack: cards });
    dDragStack.highlight(true);    
  };

  this.moveDrag = (epos, decay) => {
    dDragStack.container.move(epos[0] + decay[0],
                              epos[1] + decay[1]);  };

  this.endDrag = () => {
    dDragStack.init({ stack: [] });
  };

  this.beginSettle = (settleTarget, resolve) => {
    iSettle.begin(settleTarget, resolve);
  };

  this.init = (data) => {
    
  };

  this.update = delta => {
    iSettle.update(delta / 200);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
