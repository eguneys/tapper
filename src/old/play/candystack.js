import Pool from 'poolf';
import iPol from '../ipol';

import { dContainer } from '../asprite';
import CandyCards from './candycards';

import { isIndex, hitTest, moveHandler } from './util';

export default function CandyStack(play, ctx, bs) {

  const { events } = ctx;

  let { onBeginCard, onEndCard } = bs;

  let pCards = new Pool(() => new CandyCards(this, ctx, bs));

  let dCards = [];

  let iExtend = new iPol(0, 0, {});

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  let stack;

  this.init = data => {
    let stack = data.stack;

    let highlight = data.highlight;

    dCards.forEach(_ => {
      _.remove();
      components.splice(components.indexOf(_), 1);
    });
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

      dCard.add(container);
      components.push(dCard);

    });


    this.extend(bs.stacks.height);

    this.highlight(false);
    if (highlight) {
      highlight.forEach(n => this.highlightCard(n));
    }

    // let nbCards = dCards.length;
    // let cardExtend = bs.stacks.height / (nbCards + 3);
    // cardExtend = Math.min(cardExtend, bs.card.width * 0.5);

    // iExtend.value(iExtend.value());
    // iExtend.target(cardExtend);
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

        let b = dCard.bounds();

        let handleBounds = {
          x: b.x,
          y: b.y,
          width: b.width,
          height: lastCard?b.height:iCardExtend
        };
        return hitTest(epos[0], epos[1], handleBounds);
      });

      if (hitCard) {
        let b = hitCard.bounds();
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
        let b = dCard.bounds();
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
    handleMove(delta);
    iExtend.update(delta / 500);

    components.forEach(_ => _.update(delta));
  };

  this.globalPositionNextCard = (noNextCard) => {
    let gPos = this.globalPosition();
    let nextCardY = this.nextCardY();
    if (noNextCard) {
      nextCardY = 0;
    }
    return [gPos.x, gPos.y + nextCardY];
  };

  this.nextCardY = () => {
    let iCardExtend = iExtend.value();

    return cardY(dCards.length, iCardExtend);
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
      dCard.move(0, Math.round(posY));
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

  this.globalPosition = () => container.getGlobalPosition();

  this.move = (x, y) => container.position.set(x, y);
}
