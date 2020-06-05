import AContainer from './acontainer';

import CardStack from './cardstack';
import * as v from '../vec2';
import { iPolPlus } from './util2';

export default function Play(play, ctx, bs) {

  this.solitaire = play.solitaire;

  let dDragStack = new CardStack(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dDragStack);
  };
  initContainer();

  this.solitaire.bSelection.subscribe(({ cards }) => {
    dDragStack.init({ stack: cards });
    dDragStack.highlight(true);
  });

  this.solitaire.aSelection.subscribe(({ active, epos, decay }) => {
    if (!active) {
      return;
    }
    dDragStack.container.move(epos[0] + decay[0],
                              epos[1] + decay[1]);
  });

  let settleSource,
      settleTargetDiff;
  let iSettle = new iPolPlus({
    onBegin(oSettle) {

      let { stackN } = oSettle;

      let dStack = play.dStackN(stackN);

      settleSource = dDragStack.container.globalPosition();
      let settleTarget = dStack.nextCardGlobalPosition();

      settleTargetDiff = [settleTarget[0] - settleSource.x,
                          settleTarget[1] - settleSource.y];
    },
    onUpdate(_, i) {
      let vSettleTarget = v.cscale(settleTargetDiff, i);
      dDragStack.container.move(settleSource.x + vSettleTarget[0],
                                settleSource.y + vSettleTarget[1]);
    }
  });

  this.solitaire.fx('settle').subscribe({
    onBegin(oSettle, resolve) {
      iSettle.begin(oSettle, resolve);
    },
    onEnd() {
      dDragStack.init({ stack: [] });
    }
  });


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