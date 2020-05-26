import { dContainer } from '../asprite';

import CandyDeck from './candydeck';
import CandyStack from './candystack';

import { nStack } from '../cards';

export default function SpiderStack(play, ctx, bs) {

  let dBacks = new CandyDeck(this, ctx, {
    extendLimit: true,
    deckHeight: bs.deck.height * 3.0,
    ...bs
  });
  let dFronts = new CandyStack(this, ctx, {
    onBeginCard: (nCard, epos, decay) => {

    },
    onEndCard: (nCard) => {

    },
    ...bs
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dBacks.add(container);
    components.push(dBacks);

    dFronts.add(container);
    components.push(dFronts);

  };
  initContainer();

  let n;

  this.init = data => {
    n = data.i;

    this.refresh();
  };

  this.refresh = () => {

    let nbBacks = n + 1;
    let frontStack = nStack(n * 3);

    dBacks.init({ nbStack: nbBacks });
    dFronts.init({ stack: frontStack });

    extendCards(nbBacks, frontStack.length);
  };

  const extendCards = (backs, fronts) => {
    let nbCards = backs + fronts;
    let extend = bs.stacks.height / (nbCards + 3);

    let extendBacks = extend * backs,
        extendFronts = extend * fronts + 3;

    dBacks.extend(extendBacks);
    dFronts.extend(extendFronts);

  };

  this.update = delta => {
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
