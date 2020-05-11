import { dContainer } from '../asprite';

import CandyCards from './candycards';

import { backCard } from '../cards';

export default function CandyReveal(play, ctx, bs) {

  let dFront = new CandyCards(this, ctx, bs);
  let dBack = new CandyCards(this, ctx, bs);


  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBack.add(container);
    components.push(dBack);

    dFront.add(container);
    components.push(dFront);

    dBack.pivot(0.5, 0);
    dFront.pivot(0.5, 0);
  };
  initContainer();

  this.init = data => {
    dBack.init(backCard);
    container.visible = false;
  };

  this.beginReveal = (position, card) => {
    container.visible = true;

    dFront.init({
      ...card,
      highlight: false
    });

    dFront.scale(0, 1);
    dBack.scale(1, 1);

    this.move(position.x, position.y);
  };

  this.updateReveal = i => {
    if (i < 0.5) {
      dBack.scale(1.0-i*2, 1);
    } else {
      dFront.scale(i * 2.0 - 1.0, 1);
    }
  };

  this.endReveal = () => {
    container.visible = false;
  };

  this.update = delta => {
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
