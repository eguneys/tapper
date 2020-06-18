import AContainer from './acontainer';

import { moveHandler, hitTest } from './util';

export default function CardPlaceholder(play, ctx, bs) {

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

    let gp = container.globalPosition();

    let hitBounds = {
      x: gp.x,
      y: gp.y,
      ...cardBounds
    };

    let b = hitBounds;

    if (hitTest(...pos, b)) {

      let decay = [-pos[0] + b.x,
                   -pos[1] + b.y];

      return {
        decay
      };
    }
    return null;
  };

  const inCardHitBounds = (selectPos = _ => _.epos) => dragE => {
    let pos =  selectPos(dragE);
    let hD = getHitCardWithDecay(pos);
    if (hD) {
      return revents.once({
        decay: hD.decay,
        ...dragE
      });
    }
    return revents.never;
  };

  this.drags = revents.drags
    .flatMap(inCardHitBounds(_ => _.start));
  this.drops = revents.drops
    .flatMap(inCardHitBounds());
  this.clicks = revents.clicks
    .flatMap(inCardHitBounds());
  this.starts = revents.starts
    .flatMap(inCardHitBounds());
}
