import Pool from 'poolf';
import iPol from '../ipol';

import AContainer from './acontainer';

import CardCard from './cardcard';

import { hitTest, moveHandler } from './util';

export default function CardStack(play, ctx, bs) {

  const { events } = ctx;

  let { onBeginCard, onEndCard } = bs;

  let pCards = new Pool(() => new CardCard(this, ctx, bs));

  let dCards = [];

  let iExtend = new iPol(0, 0, {});


  let container = this.container = new AContainer();
  const initContainer = () => {
  };
  initContainer();

  this.init = (data) => {
    let stack = data.stack;
    let highlight = data.highlight;

    dCards.forEach(_ => container.removeChild(_));
    dCards = [];
    pCards.releaseAll();

    stack.forEach((card, i) => {
      let dCard = pCards.acquire(_ => {
        _.init({
          n: i,
          ...card
        });
      });

      dCards.push(dCard);

      container.addChild(dCard);
    });
    
    this.extend(bs.stacks.height);
    this.highlight(false);
    if (highlight) {
      highlight.forEach(n => this.highlightCard(n));
    }
  };

  this.extend = (eHeight) => {
    let nbCards = dCards.length;
    let cardExtend = eHeight / (nbCards + 3);
    cardExtend = Math.min(cardExtend, bs.card.width * 0.5);

    iExtend.value(iExtend.value());
    iExtend.target(cardExtend);
  };

  this.highlight = (value) => {
    dCards.forEach(_ => _.highlight(value));
  };

  this.highlightCard = (n) => {
    dCards[n].highlight(true);
  };

  const handleMove = moveHandler({
    onBegin(epos) {
      let iCardExtend = iExtend.value();

      let hitCard = dCards.find((dCard, i) => {
        let lastCard = i === (dCards.length - 1);

        let b = dCard.container.bounds();

        let handleBounds = {
          x: b.x,
          y: b.y,
          width: b.width,
          height: lastCard?b.height:iCardExtend
        };
        return hitTest(epos[0], epos[1], handleBounds);
      });

      if (hitCard) {
        let b = hitCard.container.bounds();
        let decay = [-epos[0] + b.x,
                     -epos[1] + b.y];

        if (onBeginCard) {
          onBeginCard(hitCard.n(), epos, decay);
        }
      }

    },
    onUpdate() {
      
    },
    onEnd(epos) {

      let hitCard = dCards.find((dCard, i) => {
        let b = dCard.container.bounds();
        return hitTest(epos[0], epos[1], b);
      });

      if (hitCard) {
        if (onEndCard) {
          onEndCard(hitCard.n());
        }
      }
    }
  }, events);

  this.update = delta => {
    handleMove();
    iExtend.update(delta / 200);
    this.container.update(delta);
  };

  this.nextCardGlobalPosition = (noNextCard) => {
    let gPos = container.globalPosition();
    let nextCardY = this.nextCardY();
    if (noNextCard) {
      nextCardY = 0;
    }
    return [gPos.x, gPos.y + nextCardY];
  };

  this.lastCardGlobalPosition = () => this.nextCardGlobalPosition(true);

  this.nextCardY = () => {
    let iCardExtend = iExtend.value();

    return cardY(dCards.length, iCardExtend);
  };

  this.nextCardLocalPosition = () => {
    return [0, this.nextCardY()];
  };

  this.cardsHeight = () => {
    let extendTarget = iExtend.target();
    return cardY(dCards.length + 3, extendTarget);
  };

  const cardY = (i, iCardExtend) => {
    return i * iCardExtend;
  };

  const renderCards = () => {
    let iCardExtend = iExtend.value();

    dCards.forEach((dCard, i) => {
      let posY = cardY(i, iCardExtend);
      dCard.container.move(0, Math.round(posY));
    });
  };

  this.render = () => {
    renderCards();
    this.container.render();
  };
}
