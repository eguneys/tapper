import AContainer from './acontainer';
import * as v from '../vec2';
import { iPolPlus } from './util2';

import CardStack from './cardstack';

export default function Play(play, ctx, bs) {

  let dMove = new CardStack(this, ctx, bs);

  let settleSource,
      settleTargetDiff;
  let iMove = new iPolPlus({
    onBegin(oMove) {

      let { settleTarget, 
            settleSource: _settleSource } = oMove;

      settleSource = _settleSource;

      settleTargetDiff = [settleTarget[0] -
                          settleSource[0],
                          settleTarget[1] -
                          settleSource[1]];

    },
    onUpdate(_, i) {
      let vSettleTarget = v.cscale(settleTargetDiff, i);
      dMove.container.move(settleSource[0] +
                           vSettleTarget[0],
                           settleSource[1] +
                           vSettleTarget[1]);
    }
  });

  this.beginMove = (oMove, resolve) => {

    dMove.init({ stack: oMove.cards });

    iMove.begin(oMove, resolve);
  };

  this.endMove = () => {
    dMove.init({ stack: [] });
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dMove);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    iMove.update(delta / 200);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
