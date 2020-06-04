import { dContainer } from '../asprite';

import CandyReveal from './candyreveal';

import { fxHandler } from './util';

export default function SoliReveal(play, ctx, bs) {


  let dReveal = new CandyReveal(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dReveal.add(container);
    components.push(dReveal);
  };
  initContainer();

  let solitaire;
  this.init = data => {
    solitaire = data.solitaire;
    dReveal.init({});
  };


  const handleReveal = fxHandler({
    allowEnd: true,
    onBegin({ n, card }) {

      let stack = play.soliStackN(n);
      let position = stack.globalPositionLastCard();

      dReveal.beginReveal(position, card);
      stack.refresh();
    },
    onUpdate(_, i) {
      dReveal.updateReveal(i);
    },
    onEnd({ n }) {

      let stack = play.soliStackN(n);
      stack.refresh();

      dReveal.endReveal();
    }
  }, () => solitaire.data.reveal);

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
