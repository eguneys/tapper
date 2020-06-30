import AContainer from './acontainer';
import CardCard from './cardcard';
import { iPolPlus } from './util2';
import * as v from '../vec2';

export default function Play(play, ctx, bs) {

  let dCards = new CardCard(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dCards);
  };
  initContainer();

  let settleSource,
      settleTargetDiff;

  let iDeal = new iPolPlus({
    onBegin({
      card,
      settleTarget,
      settleSource: _settleSource
    }) {

      dCards.container.visible(true);

      dCards.init(card);

      settleSource = _settleSource;
      settleTargetDiff = 
        [settleTarget[0] - settleSource[0],
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

  this.beginDeal = (oDeal, resolve) => {
    iDeal.begin(oDeal, resolve);
  };

  let duration = (1000 / 60);
  this.slow = (slow) => {
    duration = slow ? (1000 / 30) :
      (1000 / 60);
  };

  this.init = (data) => {
    
  };

  this.update = delta => {
    iDeal.update(delta / duration);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
