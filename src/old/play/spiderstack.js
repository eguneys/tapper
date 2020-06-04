import { dContainer } from '../asprite';

import CandyDeck from './candydeck';
import CandyStack from './candystack';
import CandyCardPlace from './candycardplace';

import { isIndex, fxHandler2 } from './util';

export default function SpiderStack(play, ctx, bs) {

  let n;
  let spider;

  let dBacks = new CandyDeck(this, ctx, {
    extendLimit: true,
    deckHeight: bs.deck.height * 2.0,
    ...bs
  });
  let dFronts = new CandyStack(this, ctx, {
    onBeginCard: (nCard, epos, decay) => {
      spider.beginSelect(n, nCard, epos, decay);
    },
    onEndCard: (nCard) => {
      spider.endSelect(n);
    },
    ...bs
  });

  let dCardPlace = new CandyCardPlace(this, ctx, {
    onEndCard: () => {
      spider.endSelect(n);
    },
    ...bs
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dCardPlace.add(container);
    components.push(dCardPlace);

    dBacks.add(container);
    components.push(dBacks);

    dFronts.add(container);
    components.push(dFronts);

  };
  initContainer();

  this.globalPositionNextCard = dFronts.globalPositionNextCard;
  this.globalPositionLastCard = dBacks.globalPositionLastCard;
  this.globalPositionReveal = dBacks.globalPositionReveal;

  this.init = data => {
    n = data.i;
    spider = data.spider;

    this.refresh();
  };

  const refresh = this.refresh = () => {
    let stack = spider.stack(n);
    let { hidden, front } = stack;
    let highlight = stack.highlight();

    let nbBacks = hidden.length;
    let frontStack = front;

    dCardPlace.init({});
    dBacks.init({ nbStack: nbBacks });
    dFronts.init({ stack: frontStack, highlight });

    extendCards(nbBacks, frontStack.length);
  };

  const extendCards = (backs, fronts) => {
    let nbCards = backs + fronts;
    let extend = bs.stacks.height / (nbCards + 3);

    let extendBacks = extend * backs,
        extendFronts = extend * (fronts + 3);

    dBacks.extend(extendBacks);
    dFronts.extend(extendFronts);

  };

  const handlePersistSelect = fxHandler2({
    onBegin(fxData) {
      let { stackN } = fxData;
      if (stackN === n) {
        refresh();
      }
    },
    onEnd(fxData) {
      let { stackN } = fxData;
      if (stackN === n) {
        refresh();
      }
    }
  }, () => spider.data.persistselect);

  this.update = delta => {
    handlePersistSelect(delta);
    components.forEach(_ => _.update(delta));
  };

  const renderFront = () => {
    let lb = dBacks.nextBounds();
    dFronts.move(lb[0], lb[1]);
  };

  this.render = () => {
    components.forEach(_ => _.render());
    renderFront();
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
