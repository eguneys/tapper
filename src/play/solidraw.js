import { dContainer } from '../asprite';

import TapSprite from './tapsprite';
import CandyStack from './candystack';
import CandyDeck from './candydeck';

import { fxHandler, fxHandler2, moveHandler, tapHandler, hitTest } from './util';

export default function SoliDraw(play, ctx, bs) {

  const { events, textures } = ctx;

  const mhud = textures['mhud'];

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

  let overW = bs.card.width - bs.stackMargin;

  let dOver = new TapSprite(this, ctx, {
    width: overW,
    height: overW,
    texture: mhud['over']
  });


  this.drawDeckGlobalPosition = () => {
    return dDrawDeck.globalPositionLastCard();
  };

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dDrawDeck.add(container);
    components.push(dDrawDeck);

    dDrawStack.move(0, bs.card.height + bs.deck.height);
    dDrawStack.add(container);
    components.push(dDrawStack);

    dOver.add(container);
    components.push(dOver);
    dOver.move((bs.card.width - overW) * 0.5, (bs.card.height - overW) * 0.5);
  };
  initContainer();

  let drawStack;

  this.init = data => {
    solitaire = data.solitaire;

    drawStack = solitaire.drawStack;

    refresh();
  };

  this.drawStack = () => dDrawStack;


  const reshuffle = () => {
    solitaire.reshuffle();
  };

  const refresh = () => {

    let nbDeck = drawStack.nbDeck();

    if (nbDeck === 0) {
      dOver.visible(true);
    } else {
      dOver.visible(false);
    }

    dDrawStack.init({stack: drawStack.showStack3() });
    dDrawDeck.init({nbStack: Math.min(3, drawStack.nbDeck()) });
  };

  const tapDeal = () => {
    solitaire.deal();
    dDrawStack.init({ stack: drawStack.showStack3() });
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
    onBegin(fxDataSelected) {
      let { draw } = fxDataSelected.data;
      if (draw) {
        refresh();
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
    onEnd(fxDataSettle) {
      let { draw } = fxDataSettle.data;
      if (draw) {
        refresh();
      }
    }
  }, () => solitaire.data.settle);

  const handleDrawDeal = fxHandler({
    allowEnd: true,
    onBegin(card) {
      refresh();
    },
    onUpdate() {
    },
    onEnd(card) {
      refresh();
    }
  }, () => solitaire.data.drawdeal);

  const handleTapOver = tapHandler(() => {
    let nbDeck = drawStack.nbDeck();

    if (nbDeck === 0) {
      reshuffle();
    }
  }, events, () => dOver.bounds());

  const handleDrawShuffle = fxHandler({
    allowEnd: true,
    onBegin(cards) {
      refresh();
    },
    onUpdate() {
    },
    onEnd(cards) {
      refresh();
    }
  }, () => solitaire.data.drawshuffle);

  const handleDeal = fxHandler2({
    onBegin() {
      refresh();
    },
    onUpdate() {
    },
    onEnd() {
      refresh();
    }
  }, () => solitaire.data.deal);

  this.update = delta => {
    handleTap(delta);
    handleSelected(delta);
    handleSettled(delta);
    handleDrawDeal(delta);
    handleTapOver(delta);
    handleDrawShuffle(delta);
    handleDeal(delta);
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
