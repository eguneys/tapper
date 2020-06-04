import AContainer from './acontainer';
import { iPolPlus } from './util2';

import { backCard } from '../cards';
import * as v from '../vec2';

import CardCard from './cardcard';

export default function SoliDeal(play, ctx, bs) {

  this.solitaire = play.solitaire;

  let dCards = new CardCard(this, ctx, bs);
  
  let container = this.container = new AContainer();
  const initContainer = () => {
    
  };
  initContainer();

  let settleSource,
      settleTargetDiff;

  let iDeal = new iPolPlus({
    onBegin(oDeal) {
      let { cards,
            stackN,
            isHidden } = oDeal;

      dCards.container.visible(true);

      if (isHidden) {
        dCards.init(backCard);
      } else {
        dCards.init(cards[0]);
      }

      settleSource = play.dDraw.deckGlobalPosition();
      let dDstStack = play.dStackN(stackN);
      let settleTarget = dDstStack.nextCardGlobalPosition();

      settleTargetDiff = [settleTarget[0] - settleSource.x,
                          settleTarget[1] - settleSource.y];
    },
    onUpdate(_, i) {
      let vSettleTarget = v.cscale(settleTargetDiff, i);
      dCards.container
        .move(settleSource.x + vSettleTarget[0],
              settleSource.y + vSettleTarget[1]);
    },
    onEnd() {
      dCards.container.visible(false);
    }
  });

  let observeDeal = this.solitaire.fx('deal');

  observeDeal.subfun((oDeal, resolve) => {
    iDeal.begin(oDeal, resolve);
  });

  this.init = (data) => {
    
  };

  this.update = delta => {
    iDeal.update(delta / (1000 / 30));
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
