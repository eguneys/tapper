import { dContainer } from '../asprite';

import CandyStack from './candystack';

import { fxHandler } from './util';

import * as v from '../vec2';

export default function SpiderMove(play, ctx, bs) {

  let dMoveStack = new CandyStack(this, ctx, bs);
  
  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dMoveStack.add(container);
    components.push(dMoveStack);
  };
  initContainer();

  let spider;

  this.init = data => {
    spider = data.spider;
  };

  let moveSource;
  let moveTargetDiff;
  const handleMove = fxHandler({
    allowEnd: true,
    duration: 200,
    onBegin({ srcStackN, dstStackN, cards }) {
      let srcStack = play.stackN(srcStackN),
          dstStack = play.stackN(dstStackN);

      srcStack.refresh();

      moveSource = srcStack.globalPositionNextCard();
      let moveTarget = dstStack.globalPositionNextCard();

      moveTargetDiff = [moveTarget[0] - moveSource[0],
                        moveTarget[1] - moveSource[1]];

      dMoveStack.init({ stack: cards });
    },
    onUpdate(_, i) {
      let vMoveTarget = v.cscale(moveTargetDiff, i);
      dMoveStack.move(moveSource[0] + vMoveTarget[0],
                      moveSource[1] + vMoveTarget[1]);      
    },
    onEnd({ dstStackN }) {
      play.stackN(dstStackN).refresh();
      dMoveStack.init({ stack: [] });
    }
  }, () => spider.data.move);

  this.update = delta => {
    handleMove(delta);
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
