import AContainer from './acontainer';

import { moveHandler, hitTest } from './util';

export default function Play(play, ctx, bs) {

  const { revents, events } = ctx;

  let { onBeginCard, onEndCard } = bs;

  let cardBounds = {
    width: bs.card.width,
    height: bs.card.height
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    
  };
  initContainer();

  this.init = (data) => {};

  let hitBounds;

  let handleMove = moveHandler({
    onBegin(epos) {
      let pos = container.globalPosition();

      hitBounds = {
        x: pos.x,
        y: pos.y,
        ...cardBounds
      };
      
      if (hitTest(...epos, hitBounds)) {
        
        let decay = [-epos[0] + hitBounds.x,
                     -epos[1] + hitBounds.y];

        if (onBeginCard) {
          onBeginCard(epos, decay);
        }

      }
    },
    onUpdate() {
    },
    onEnd(epos) {
      if (hitTest(...epos, hitBounds)) {
        if (onEndCard) {
          onEndCard();
        }
      }
    }
  }, events);

  this.update = delta => {
    handleMove(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  const getHitCardWithDecay = pos => {

    let b = container.bounds();
    
    if (hitTest(...pos, hitBounds)) {
      
      let decay = [-pos[0] + b.x,
                   -pos[1] + b.y];

      return {
        decay
      };
    }
    return null;
  };

  const inCardHitBounds = dragE => {
    let pos =  dragE.epos;
    let hD = getHitCardWithDecay(pos);
    if (hD) {
      return revents.once({
        decay: hD.decay,
        ...dragE
      });
    }
    return revents.never;
  };

  this.drops = revents.drops
    .flatMap(inCardHitBounds);
}
