import AContainer from './acontainer';
import ASprite from './asprite';

import CardStack from './cardstack';

import { backCard, hiddenStacks } from '../cards';

import { fEInBounds } from './rutil';

export default function SoliDraw(play, ctx, bs) {

  let rsolitaire = play.rsolitaire;

  const { revents, textures } = ctx;

  const mhud = textures['mhud'];

  let dDeck = new CardStack(this, ctx, bs);

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

  // const observePSelection = ({ 
  //   active,
  //   drawN
  // }) => {
    
  //   if (!drawN) {
  //     return;
  //   }

  //   if (active) {
  //     dDraw.highlightCards([0]);
  //   } else {
  //     dDraw.highlight(false);
  //   }

  // };

  // solitaire.pSelection.subscribe(observePSelection);

  this.init = (data) => {
    listenSolitaire();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  const initDrawer = (drawer) => {
    let nbDeck = drawer.nbDeck();

    if (nbDeck === 0) {
      dOver.visible(true);
    } else {
      dOver.visible(false);
    }

    dDeck.init({ stack: hiddenStacks[Math.min(3, nbDeck)] });
    dDeck.extend(bs.deck.height);

    dDraw.init({ stack: drawer.showStack3() });
  };

  const listenSolitaire = () => {
    rsolitaire().pDrawer.onValue(initDrawer);
  };

  this.esShuffle = revents.clicks
    .filter(fEInBounds(_ => _.epos, 
                       () => dOver.container.bounds()))
    .filter(_ => dDeck.empty())
    .map(_ => true);

  this.esDeal = dDeck.clicks;

  const insertDrawN = _ => ({ ..._, drawN: true });

  this.esDrags = dDraw.drags.map(insertDrawN);

}
