import { dContainer } from '../asprite';

import CandyReveal from './candyreveal';

import { fxHandler } from './util';

export default function SpiderReveal(play, ctx, bs) {


  let dReveal = new CandyReveal(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dReveal.add(container);
    components.push(dReveal);
  };
  initContainer();

  let spider;
  this.init = data => {
    spider = data.spider;
    dReveal.init({});
  };


  const handleReveal = fxHandler({
    allowEnd: true,
    onBegin({ n, card }) {

      let stack = play.stackN(n);
      let position = stack.globalPositionReveal();

      dReveal.beginReveal(position, card);
      stack.refresh();
    },
    onUpdate({ n }, i) {

      let stack = play.stackN(n);
      let position = stack.globalPositionReveal();

      dReveal.updateReveal(i, position);
    },
    onEnd({ n }) {

      let stack = play.stackN(n);
      stack.refresh();

      dReveal.endReveal();
    }
  }, () => spider.data.reveal);

  this.update = delta => {
    handleReveal(delta);
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
