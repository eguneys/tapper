import { dContainer } from '../asprite';

import CandyStack from './candystack';
import CandyDeck from './candydeck';

import { fxHandler2, moveHandler, hitTest } from './util';

export default function SoliDraw(play, ctx, bs) {

  const { events } = ctx;

  let solitaire;

  let dDrawDeck = new CandyDeck(this, ctx, {
    deckHeight: bs.deck.height,
    ...bs
  });
  let dDrawStack = new CandyStack(this, ctx, {
    onBeginCard: (n, epos, decay) => {
      solitaire.selectDraw(epos, decay);
    },
    ...bs
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dDrawDeck.add(container);
    components.push(dDrawDeck);

    dDrawStack.move(0, bs.card.height + bs.deck.height);
    dDrawStack.add(container);
    components.push(dDrawStack);
  };
  initContainer();

  this.init = data => {
    solitaire = data.solitaire;

    dDrawStack.init({stack: solitaire.showStack() });
    dDrawDeck.init({nbStack: 3});
  };

  this.drawStack = () => dDrawStack;


  const tapDeal = () => {
    solitaire.deal();
    dDrawStack.init({ stack: solitaire.showStack() });
  };

  const handleTap = moveHandler({
    onBegin(epos) {
      let drawBounds = dDrawDeck.bounds();

      if (hitTest(epos[0], epos[1], drawBounds)) {
        tapDeal();
      }
    },
    onUpdate(epos) {
    },
    onEnd() {
    }
  }, events);

  const handleSelected = fxHandler2({
    onBegin({ draw }) {
      if (draw) {
        dDrawStack.init({stack: solitaire.showStack() });
      }
    },
    onUpdate() {
    },
    onEnd() {
    }
  }, () => solitaire.data.selected);

  const handleSettled = fxHandler2({
    onBegin() {
    },
    onUpdate() {
    },
    onEnd({selected}) {

      let { draw } = selected;

      if (draw) {
        dDrawStack.init({stack: solitaire.showStack() });
      }
    }
  }, () => solitaire.data.settle);

  this.update = delta => {
    handleTap(delta);
    handleSelected(delta);
    handleSettled(delta);
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
