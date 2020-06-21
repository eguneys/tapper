import AContainer from './acontainer';

import { moveHandler2 } from './util';

export default function Play(play, ctx, bs) {

  let gsolitaire = play.gsolitaire;

  const { events } = ctx;

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
      gsolitaire.userActionDragEnd({
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
