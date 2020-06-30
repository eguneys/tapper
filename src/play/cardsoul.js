import AContainer from './acontainer';

import { callMaybe, moveHandler2 } from './util';

export default function CardSoul(play, ctx, bs) {

  let doubleClickThreshold = 300;

  const { events } = ctx;

  let pLastDrop = Promise.resolve();
  let lastEnd;

  const handleMove = moveHandler2({
    onBegin(epos) {
      let nowEnd = Date.now();
      if (lastEnd) {
        if (nowEnd - lastEnd < doubleClickThreshold) {
          callMaybe(bs.onDoubleClick);
          lastEnd = null;
          return;
        }
      }
      lastEnd = nowEnd;

      callMaybe(bs.onDragStart, epos);
    },
    onMove(epos) {
      callMaybe(bs.onDragMove, epos);
    },
    onEnd(epos) {
      callMaybe(bs.onDragEnd, epos);
    }
  }, events);


  let container = this.container = new AContainer();

  this.init = (data) => {
    
  };

  let dontHandleMoves = false;

  this.dontHandleMoves = off => {
    dontHandleMoves = off;
  };

  this.update = delta => {
    if (!dontHandleMoves) {
      handleMove(delta);
    }
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
