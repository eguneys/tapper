import AContainer from './acontainer';

import CardCard from './cardcard';

import { backCard } from '../cards';

export default function Play(play, ctx, bs) {

  let dFront = new CardCard(this, ctx, bs);
  let dBack = new CardCard(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dFront);
    container.addChild(dBack);

    dFront.container.pivot(0.5, 0);
    dBack.container.pivot(0.5, 0);

    dBack.init(backCard);
    container.visible(false);
  };
  initContainer();

  this.init = (data) => {
  };

  this.beginReveal = (card) => {
    container.visible(true);

    dFront.init({
      ...card,
      highlight: false
    });

    dFront.container.scale(0, 1);
    dBack.container.scale(1, 1);
  };

  this.updateReveal = (i) => {
    if (i < 0.5) {
      dBack.container.scale(1.0-i*2, 1);
    } else {
      dFront.container.scale(i * 2.0 - 1.0, 1);
    }
  };

  this.endReveal = () => {
    container.visible(false);
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}