import AContainer from './acontainer';

import { moveHandler2 } from './util';

export default function Play(play, ctx, bs) {

  let doubleClickThreshold = 300;

  let gsolitaire = play.gsolitaire;

  const { events } = ctx;

  let pLastDrop = Promise.resolve();
  let lastEnd;

  const handleMove = moveHandler2({
    onBegin(epos) {
      let nowEnd = Date.now();
      if (lastEnd) {
        if (nowEnd - lastEnd < doubleClickThreshold) {
          pLastDrop.then(() => {
            let dest = play.getHitKeyForEpos(epos);
            if (dest) {
              gsolitaire.userActionDoubleClick(dest);
            }
          });
          lastEnd = null;
          return;
        }
      }
      lastEnd = nowEnd;

      let orig = play.getHitKeyForEpos(epos);
      gsolitaire.userActionDragStart({
        epos,
        ...orig
      });
    },
    onMove(epos) {
      gsolitaire.userActionDragMove(epos);
    },
    onEnd(epos) {
      let dest = play.getHitKeyForEpos(epos);
      pLastDrop = gsolitaire.userActionDragEnd({
        epos,
        ...dest
      });
    }
  }, events);


  let container = this.container = new AContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    handleMove(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
