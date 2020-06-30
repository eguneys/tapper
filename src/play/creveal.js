import { iPolPlus } from './util2';
import AContainer from './acontainer';
import CardReveal from './cardreveal';

export default function CReveal(play, ctx, bs) {

  let dReveal = new CardReveal(this, ctx, bs);

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

  this.beginReveal = (card, pos, resolve) => {
    dReveal.beginReveal(card);
    dReveal.container.move(pos[0], pos[1]);

    iReveal.begin(card, resolve);
  };

  this.endReveal = () => {
    dReveal.endReveal();
  };

  this.beginUnreveal = (card, pos, resolve) => {
    dReveal.beginUnreveal(card);
    dReveal.container.move(pos[0], pos[1]);

    iUnReveal.begin(card, resolve);    
  };

  this.endUnreveal = () => {
    dReveal.endUnreveal();
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dReveal);
  };
  initContainer();

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
