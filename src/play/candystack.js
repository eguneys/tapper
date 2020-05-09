import Pool from 'poolf';
import iPol from '../ipol';

import { dContainer } from '../asprite';
import CandyCards from './candycards';

import { hitTest, moveHandler } from './util';

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

    pCards.releaseAll();
    dCards.forEach(_ => {
      _.remove();
      components.splice(components.indexOf(_), 1);
    });
    dCards = [];

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

    let nbCards = dCards.length;
    let cardExtend = bs.stacks.height / (nbCards + 1);
    cardExtend = Math.min(cardExtend, bs.card.width * 0.5);

    iExtend.both(cardExtend, cardExtend);
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
        if (onBeginCard) {
          onBeginCard(hitCard.n());
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

  const renderCards = () => {
    let iCardExtend = iExtend.value();

    dCards.forEach((dCard, i) => {
      dCard.move(0, i * iCardExtend);
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

  this.move = (x, y) => container.position.set(x, y);
}
