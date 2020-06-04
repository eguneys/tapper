import { dContainer } from '../asprite';

import CandyCards from './candycards';

export default function Play(play, ctx, bs) {

  let dSuits = [
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs),
    new CandyCards(this, ctx, bs)
  ];

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dSuits.forEach((dSuit, n) => {
      dSuit.move(0, (bs.draws.height * 0.2) * n);
      dSuit.add(container);
      components.push(dSuit);
    });

  };
  initContainer();

  this.init = data => {

    refresh();
  };

  const refresh = () => {

    const suits = [
      'clubs',
      'hearts',
      'diamonds',
      'spades',
      'spades',
      'spades',
      'spades',
      'spades'];

    dSuits.forEach((dSuit, n) => {
      let suit = suits[n];

      if (suit) {
        dSuit.visible(true);
        dSuit.init({ suit, rank: 'king' });
      } else {
        dSuit.visible(false);
      }
    });
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
