import AContainer from './acontainer';
import CardStack from './cardstack';
import { backCard, hiddenStacks } from '../cards';

export default function SpiderDraw(play, ctx, bs) {

  let gspider = play.gspider;

  let dDeck = new CardStack(this, ctx, {
    onBeginCard() {
      gspider.userActionDealDraw();
    },
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dDeck);
    
  };
  initContainer();

  this.init = (data) => {
    
  };

  gspider.drawer.subscribe(drawer => {
    let nbDeck = drawer.nbDeck();

    
    dDeck.init({ stack: hiddenStacks[Math.min(3, nbDeck)] });
    dDeck.extend(bs.card.height * 0.2);
  });

  this.deckGlobalPosition = dDeck.lastCardGlobalPosition;

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
