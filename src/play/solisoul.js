import AContainer from './acontainer';

import { moveHandler2 } from './util';

export default function Play(play, ctx, bs) {

  let doubleClickThreshold = 1000;

  let gsolitaire = play.gsolitaire;

  const { events } = ctx;

  let lastEnd;

  const handleMove = moveHandler2({
    onBegin(epos) {
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
      let pEnd = gsolitaire.userActionDragEnd({
        epos,
        ...dest
      });

      pEnd.then(() => {
        let nowEnd = Date.now();
        if (lastEnd) {
          if (nowEnd - lastEnd < doubleClickThreshold) {
            if (dest) {
              gsolitaire.userActionDoubleClick(dest);
            }
            lastEnd = null;
          }
        }
        lastEnd = nowEnd;
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
