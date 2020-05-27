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

  let nbStack;

  this.init = data => {
    nbStack = data.nbStack;

    dCards.forEach(_ => {
      _.remove();
      components.splice(components.indexOf(_), 1);
    });
    dCards = [];
    pCards.releaseAll();

    for (let i = 0; i < nbStack; i++) {
      let dCard = pCards.acquire(_ => {
        _.init(backCard);
      });

      dCards.push(dCard);

      dCard.add(container);
      components.push(dCard);
    }

    // let cardExtend = nbStack === 0 ? 0 : deckHeight / nbStack;
    // if (extendLimit) {
    //   cardExtend = Math.max(deckHeight, cardExtend);
    // }
    // iExtend.value(iExtend.value());
    // iExtend.target(cardExtend);
  };

  this.extend = (height) => {
    height = Math.min(deckHeight, height);
    let cardExtend = nbStack === 0 ? 0 : height / nbStack;
    iExtend.value(iExtend.value());
    iExtend.target(cardExtend);
  };

  this.nextBounds = () => {
    let iCardExtend = iExtend.value();

    let nextI = dCards.length;

    return [0, cardY(nextI, iCardExtend)];
  };

  this.globalPositionLastCard = () => {
    if (dCards.length === 0) {
      return container.getGlobalPosition();
    }

    let card = dCards[dCards.length - 1];

    return card.globalPosition();
  };

  this.globalPositionReveal = () => {
    let gp = container.getGlobalPosition();

    let nb = this.nextBounds();

    gp.x += nb[0];
    gp.y += nb[1];

    return gp;
  };

  const cardY = (i, iCardExtend) => {
    return i * iCardExtend;
  };

  this.update = delta => {
    iExtend.update(delta / 200);
    components.forEach(_ => _.update(delta));
  };
  
  const renderCards = () => {
    let iCardExtend = iExtend.value();

    dCards.forEach((dCard, i) => {
      dCard.move(0, cardY(i, iCardExtend));
    });
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
