import Pool from 'poolf';
import iPol from '../ipol';
import { dContainer } from '../asprite';

import CandyCards from './candycards';

import { backCard } from '../cards';

export default function CandyDeck(play, ctx, bs) {

  let { extendLimit, deckHeight } = bs;

  let pCards = new Pool(() => new CandyCards(this, ctx, bs));

  let dCards = [];

  let iExtend = new iPol(0, 0, {});


  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  this.init = data => {
    let nbStack = data.nbStack;

    for (let i = 0; i < nbStack; i++) {
      let dCard = pCards.acquire(_ => {
        _.init(backCard);
      });

      dCards.push(dCard);

      dCard.add(container);
      components.push(dCard);
    }

    let cardExtend = nbStack === 0 ? 0 : deckHeight / nbStack;
    if (extendLimit) {
      cardExtend = Math.max(deckHeight, cardExtend);
    }
    iExtend.both(0, cardExtend);
  };

  let lastBounds;
  this.lastBounds = () => lastBounds;

  this.update = delta => {
    iExtend.update(delta / 200);
    components.forEach(_ => _.update(delta));
  };

  const renderCards = () => {
    let iCardExtend = iExtend.value();

    let lastI = -1;
    dCards.forEach((dCard, i) => {
      dCard.move(0, i * iCardExtend);
      lastI = i;
    });
    lastBounds = [0, (lastI + 1) * iCardExtend];
  };

  this.render = () => {
    renderCards();

    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.bounds = () => container.getBounds();

  this.move = (x, y) => container.position.set(x, y);
}
