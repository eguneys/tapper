import AContainer from './acontainer';
import { iPolPlus } from './util2';

import { backCard } from '../cards';
import * as v from '../vec2';

import CardCard from './cardcard';

export default function SoliDeal(play, ctx, bs) {

  this.gsolitaire = play.gsolitaire;
  this.solitaire = play.solitaire;

  let dCards = new CardCard(this, ctx, bs);
  
  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dCards);
    dCards.container.visible(false);
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

      settleTargetDiff = [settleTarget[0] - settleSource[0],
                          settleTarget[1] - settleSource[1]];

    },
    onUpdate(_, i) {
      let vSettleTarget = v.cscale(settleTargetDiff, i);
      dCards.container
        .move(settleSource[0] + vSettleTarget[0],
              settleSource[1] + vSettleTarget[1]);
    },
    onEnd() {
      dCards.container.visible(false);
    }
  });

  this.gsolitaire.fx('deal').subfun((oDeal, resolve) => {
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
