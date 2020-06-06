import { iPolPlus } from './util2';
import AContainer from './acontainer';

import CardReveal from './cardreveal';

export default function Play(play, ctx, bs) {

  let dReveal = new CardReveal(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dReveal);
  };
  initContainer();

  let iReveal = new iPolPlus({
    onUpdate(_, i) {
      dReveal.updateReveal(i);
    }
  });

  let iUnReveal = new iPolPlus({
    onUpdate(_, i) {
      dReveal.updateUnreveal(i);
    }
  });

  play.solitaire.fx('reveal').subscribe({
    onBegin({ stackN, card }, resolve) {
      let dStack = play.dStackN(stackN);
      let pos = dStack.lastCardGlobalPosition();

      dReveal.beginReveal(card);
      dReveal.container.move(pos[0], pos[1]);

      iReveal.begin(card, resolve);
    },
    onEnd() {
      dReveal.endReveal();
    }
  });

  play.solitaire.fx('unreveal').subscribe({
    onBegin({ stackN, card }, resolve) {
      let dStack = play.dStackN(stackN);
      let pos = dStack.lastCardGlobalPosition();

      dReveal.beginUnreveal(card);
      dReveal.container.move(pos[0], pos[1]);

      iUnReveal.begin(card, resolve);
    },
    onEnd() {
      dReveal.endUnreveal();
    }
  });

  this.init = (data) => {
    
  };

  this.update = delta => {
    iReveal.update(delta / 200);
    iUnReveal.update(delta / 200);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
