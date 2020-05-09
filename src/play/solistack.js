import { dContainer } from '../asprite';

import CandyDeck from './candydeck';
import CandyStack from './candystack';

import { fxHandler2 } from './util';

export default function Solistack(play, ctx, bs) {

  let solitaire;
  let stack;


  let dBacks = new CandyDeck(this, ctx, {
    extendLimit: true,
    deckHeight: bs.deck.height,
    ...bs
  });
  let dFronts = new CandyStack(this, ctx, {
    onBeginCard: (nCard) => {
      solitaire.select(stack.n, nCard);
    },
    onEndCard: (nCard) => {
      solitaire.endSelect(stack.n);
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

  this.init = data => {
    solitaire = data.solitaire;
    stack = solitaire.stack(data.i);

    dBacks.init({ nbStack: stack.hidden.length });
    dFronts.init({ stack: stack.front });
  };

  const handleSelected = fxHandler2({
    onBegin({ stackN }) {
      if (stackN === stack.n) {
        dFronts.init({ stack: solitaire.stack(stackN).front });
      }
    },
    onUpdate() {
    },
    onEnd({ stackN, dstStackN }) {
      if (dstStackN === stack.n) {
        dFronts.init({ stack: solitaire.stack(dstStackN).front });
      }
    }
  }, () => solitaire.data.selected);

  this.update = delta => {
    handleSelected(delta);
    components.forEach(_ => _.update(delta));
  };

  const renderFront = () => {
    let lb = dBacks.lastBounds();
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
