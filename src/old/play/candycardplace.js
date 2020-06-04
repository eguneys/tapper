import { dContainer } from '../asprite';

import { moveHandler, hitTest } from './util';

export default function CandyCardPlace(play, ctx, bs) {

  const { events } = ctx;

  let { onBeginCard, onEndCard } = bs;

  let cardBounds = {
    width: bs.card.width,
    height: bs.card.height
  };

  let hitBounds;

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  this.init = data => {

    let pos = container.getGlobalPosition();

    hitBounds = {
      x: pos.x,
      y: pos.y,
      ...cardBounds,
    };
  };

  let handleMove = moveHandler({
    onBegin(epos) {
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
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
