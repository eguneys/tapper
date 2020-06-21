import AContainer from './acontainer';
import ASprite from './asprite';

import CardStack from './cardstack';

import { backCard, hiddenStacks } from '../cards';

import { tapHandler2 } from './util';

export default function SoliDraw(play, ctx, bs) {

  let gsolitaire = play.gsolitaire;
  let solitaire = play.solitaire;

  const { events, textures } = ctx;

  const mhud = textures['mhud'];

  let dDeck = new CardStack(this, ctx, {
    onBeginCard() {
      gsolitaire.userActionDealDraw();
    },
    ...bs
  });

  let dDraw = new CardStack(this, ctx, bs);

  let overW = bs.card.width - bs.stackMargin;

  let dOver = new ASprite(this, ctx, {
    width: overW,
    height: overW,
    texture: mhud['over']
  });

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dDeck);

    container.addChild(dDraw);
    dDraw.container.move(0, bs.card.height + bs.deck.height);

    dOver.container.move((bs.card.width - overW) * 0.5,
                         (bs.card.height - overW) * 0.5);

    container.addChild(dOver);
    dOver.visible(false);

  };
  initContainer();

  this.dDrawN = dDraw;
  this.deckGlobalPosition = dDeck.lastCardGlobalPosition;
  this.showGlobalPosition = dDraw.nextCardGlobalPosition;

  this.getHitKeyForEpos = epos => {
    let res = dDraw.getHitCardForEpos(epos);
    if (res) {
      res.drawN = true;
    }
    return res;
  };

  gsolitaire.drawer.subscribe(drawer => {
    let nbDeck = drawer.nbDeck();

    if (nbDeck === 0) {
      dOver.visible(true);
    } else {
      dOver.visible(false);
    }

    dDeck.init({ stack: hiddenStacks[Math.min(3, nbDeck)] });
    dDeck.extend(bs.deck.height);

    dDraw.init({ stack: drawer.showStack3() });
  });

  gsolitaire.fx('dealdraw').subscribe({
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

  gsolitaire.pSelection.subscribe(observePSelection);

  this.init = (data) => {};

  const handleTapOver = tapHandler2({
    onBegin() {
      let isDrawEmpty = dDeck.empty();

      if (isDrawEmpty) {
        gsolitaire.userActionShuffle();
      }
    },
    boundsFn: () => dOver.container.bounds()
  }, events);

  this.update = delta => {
    handleTapOver();
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
