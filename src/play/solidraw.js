import AContainer from './acontainer';
import CardStack from './cardstack';

import { backCard, hiddenStacks } from '../cards';

export default function SoliDraw(play, ctx, bs) {

  let solitaire = play.solitaire;

  const { textures } = ctx;

  const mhud = textures['mhud'];

  let dDeck = new CardStack(this, ctx, {
    onBeginCard() {
      solitaire.userActionDealDraw();
    },
    ...bs
  });

  let dDraw = new CardStack(this, ctx, {
    onBeginCard(n, epos, decay) {
      solitaire.userActionSelectDraw(epos, decay);
    },
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dDeck);

    container.addChild(dDraw);
    dDraw.container.move(0, bs.card.height + bs.deck.height);

  };
  initContainer();

  this.dDrawN = dDraw;
  this.deckGlobalPosition = dDeck.lastCardGlobalPosition;
  this.showGlobalPosition = dDraw.nextCardGlobalPosition;

  solitaire.drawer.subscribe(drawer => {
    let nbDeck = drawer.nbDeck();

    if (nbDeck === 0) {
      // dOver.visible(true);
    } else {
      // dOver.visible(false);
    }

    dDeck.init({ stack: hiddenStacks[Math.min(3, nbDeck)] });
    dDeck.extend(bs.deck.height);

    dDraw.init({ stack: drawer.showStack3() });
  });

  solitaire.fx('dealdraw').subscribe({
    onBegin(card, resolve) {
      resolve();
    },
    onEnd() {
    }
  });

  const observePSelection = ({ 
    active,
    drawN
  }) => {
    
    if (!drawN) {
      return;
    }

    if (active) {
      dDraw.highlightCards([0]);
    } else {
      dDraw.highlight(false);
    }

  };

  solitaire.pSelection.subscribe(observePSelection);

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
