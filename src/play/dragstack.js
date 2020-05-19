import { dContainer } from '../asprite';

import CandyStack from './candystack';

import { isIndex } from '../solitaire';
import { fxHandler, fxHandler2 } from './util';
import * as v from '../vec2';

export default function Play(play, ctx, bs) {

  const { events } = ctx;

  let dDragStack = new CandyStack(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dDragStack.add(container);
    components.push(dDragStack);
  };
  initContainer();

  let solitaire;
  this.init = data => {
    solitaire = data.solitaire;
  };

  const handleDrag = fxHandler2({
    onBegin(fxDataSelected) {
      let { epos, stack, decay } = fxDataSelected.data;

      dDragStack.move(epos[0] + decay[0], epos[1] + decay[1]);
      dDragStack.init({ stack });
      dDragStack.highlight(true);
    },
    onUpdate(fxDataSelected) {
      let { epos, decay } = fxDataSelected.data;
      dDragStack.move(epos[0] + decay[0], epos[1] + decay[1]);
    },
    onEnd() {
    }
  }, () => solitaire.data.selected);
  

  let settleSource;
  let settleTargetDiff;
  const handleSettle = fxHandler({
    allowEnd: true,
    duration: 100,
    onBegin(fxDataSettle) {

      let { dststack,
            dsthole,
            dstHoleN,
            dstStackN } = fxDataSettle.data;

      settleSource = dDragStack.globalPosition();

      if (dsthole) {
        let dDstHole = play.soliHoleN(dstHoleN);
        let settleTarget = dDstHole.globalPosition();

        settleTargetDiff = [settleTarget.x - settleSource.x,
                            settleTarget.y - settleSource.y];        
      } else if (dststack) {
        let dDstStack = play.soliStackN(dstStackN);
        let settleTarget = dDstStack.globalPositionNextCard();

        settleTargetDiff = [settleTarget[0] - settleSource.x,
                            settleTarget[1] - settleSource.y];        
      } else {
        let dDstStack = play.drawStack();
        let settleTarget = dDstStack.globalPositionNextCard(false);

        settleTargetDiff = [settleTarget[0] - settleSource.x,
                            settleTarget[1] - settleSource.y];
      }
    },
    onUpdate(_, i) {
      let vSettleTarget = v.cscale(settleTargetDiff, i);
      dDragStack.move(settleSource.x + vSettleTarget[0],
                      settleSource.y + vSettleTarget[1]);
    },
    onEnd() {
      dDragStack.init({ stack: [] });
    }
  }, () => solitaire.data.settle);

  this.update = delta => {
    handleDrag(delta);
    handleSettle(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
