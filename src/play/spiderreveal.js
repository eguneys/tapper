import AContainer from './acontainer';
import CReveal from './creveal';

export default function Play(play, ctx, bs) {

  let dReveal = new CReveal(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dReveal);
  };
  initContainer();

  this.init = (data) => {};

  play.gspider.fx('reveal').subscribe({
    onBegin({ stackN, card }, resolve) {
      let dStack = play.dStackN(stackN);
      let pos = dStack.lastCardGlobalPosition();

      dReveal.beginReveal(card, pos, resolve);
    },
    onEnd() {
      dReveal.endReveal();
    }
  });

  play.gspider.fx('unreveal').subscribe({
    onBegin({ stackN, card }, resolve) {
      let dStack = play.dStackN(stackN);
      let pos = dStack.lastCardGlobalPosition();

      dReveal.beginUnreveal(card, pos, resolve);
    },
    onEnd() {
      dReveal.endUnreveal();
    }
  });

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
