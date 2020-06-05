import * as v from '../vec2';
import { iPolPlus } from './util2';
import AContainer from './acontainer';

import CardStack from './cardstack';

export default function SoliMove(play, ctx, bs) {

  let dMove = new CardStack(this, ctx, bs);

  this.solitaire = play.solitaire;

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dMove);
  };
  initContainer();

  let settleSource,
      settleTargetDiff;
  let iMove = new iPolPlus({
    onBegin(oMove) {

      let { srcStackN, dstStackN } = oMove;

      let dSrc = play.dStackN(srcStackN),
          dDst = play.dStackN(dstStackN);

      settleSource = dSrc.nextCardGlobalPosition();
      let settleTarget = dDst.nextCardGlobalPosition();
      
      settleTargetDiff = [settleTarget[0] - settleSource[0],
                          settleTarget[1] - settleSource[1]];

    },
    onUpdate(_, i) {
      let vSettleTarget = v.cscale(settleTargetDiff, i);
      dMove.container.move(settleSource[0] + vSettleTarget[0],
                           settleSource[1] + vSettleTarget[1]);
    }
  });

  this.solitaire.fx('move').subscribe({
    onBegin(oMove, resolve) {

      dMove.init({ stack: oMove.cards });

      iMove.begin(oMove, resolve);
    },
    onEnd() {
      dMove.init({ stack: [] });
    }
  });

  this.init = (data) => {};

  this.update = delta => {
    iMove.update(delta / 200);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}