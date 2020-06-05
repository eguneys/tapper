import AContainer from './acontainer';
import CardStack from './cardstack';

import { backCard, hiddenStacks } from '../cards';

export default function SoliDraw(play, ctx, bs) {

  let solitaire = play.solitaire;

  const { textures } = ctx;

  const mhud = textures['mhud'];

  let dDeck = new CardStack(this, ctx, {
    onBeginCard() {
      console.log('tap');
    },
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dDeck);

  };
  initContainer();

  this.deckGlobalPosition = () => {
    return dDeck.lastCardGlobalPosition();
  };

  this.init = (data) => {
    let nb = 3;

    dDeck.init({ stack: hiddenStacks[nb] });
    dDeck.extend(bs.deck.height);
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
