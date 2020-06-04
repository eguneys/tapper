import AContainer from './acontainer';
import CardStack from './cardstack';

import { backCard } from '../cards';

const hiddenDecks = (() => {
  let res = {};

  for (let i = 1; i < 8; i++) {
    res[i] = new Array(i).fill(backCard);
  }
  return res;
})();

export default function SoliDraw(play, ctx, bs) {

  let solitaire = play.solitaire;

  const { textures } = ctx;

  const mhud = textures['mhud'];

  let dDeck = new CardStack(this, ctx, bs);

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

    dDeck.init({ stack: hiddenDecks[nb] });
    dDeck.extend(bs.deck.height);
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
