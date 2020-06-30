import AContainer from './acontainer';
import { backCard } from '../cards';
import CDeal from './cdeal';

export default function SpiDeal(play, ctx, bs) {

  let gspider = play.gspider;

  let dDeal = new CDeal(this, ctx, bs);
  
  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dDeal);
  };
  initContainer();

  gspider
    .fx('deal')
    .subfun(({ 
      slow,
      hidden, 
      stackN,
      cards }, resolve) => {

      let card = hidden ? backCard : cards[0];

      let dDstStack = play.dStackN(stackN);
      let settleTarget = dDstStack.nextCardGlobalPosition();
      let settleSource = play.dDraw.deckGlobalPosition();

        dDeal.slow(slow);
        
      dDeal.beginDeal({
        card,
        settleSource,
        settleTarget
      }, resolve);
  });

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
