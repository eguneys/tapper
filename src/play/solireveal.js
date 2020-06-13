import AContainer from './acontainer';

import CardReveal from './cardreveal';
import { isN, isUndefined } from '../soliutils';

export default function Play(play, ctx, bs) {

  let rsolitaire = play.rsolitaire;

  let dReveal = new CardReveal(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dReveal);
  };
  initContainer();

  // let iReveal = new iPolPlus({
  //   onUpdate(_, i) {
  //     dReveal.updateReveal(i);
  //   }
  // });

  // let iUnReveal = new iPolPlus({
  //   onUpdate(_, i) {
  //     dReveal.updateUnreveal(i);
  //   }
  // });

  // play.solitaire.fx('reveal').subscribe({
  //   onBegin({ stackN, card }, resolve) {
  //     let dStack = play.dStackN(stackN);
  //     let pos = dStack.lastCardGlobalPosition();

  //     dReveal.beginReveal(card);
  //     dReveal.container.move(pos[0], pos[1]);

  //     iReveal.begin(card, resolve);
  //   },
  //   onEnd() {
  //     dReveal.endReveal();
  //   }
  // });

  // play.solitaire.fx('unreveal').subscribe({
  //   onBegin({ stackN, card }, resolve) {
  //     let dStack = play.dStackN(stackN);
  //     let pos = dStack.lastCardGlobalPosition();

  //     dReveal.beginUnreveal(card);
  //     dReveal.container.move(pos[0], pos[1]);

  //     iUnReveal.begin(card, resolve);
  //   },
  //   onEnd() {
  //     dReveal.endUnreveal();
  //   }
  // });

  this.init = (data) => {
    listenSolitaire();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  const beginReveal = (oReveal) => {
    let { stackN, card } = oReveal;
    let dStack = play.dStackN(stackN);
    let pos = dStack.lastCardGlobalPosition();

    dReveal.beginReveal(card);
    dReveal.container.move(pos[0], pos[1]);
  };

  const updateReveal = (i) => {
    dReveal.updateReveal(i);
  };

  const endReveal = () => {
    dReveal.endReveal();
  };

  const listenSolitaire = () => {
    play.rsolitaire().pFx('reveal').onValue(reveal => {
      let { i, oReveal } = reveal;

      if (oReveal && isUndefined(i)) {
        beginReveal(oReveal);
      } else if (!isUndefined(i)) {
        updateReveal(i);
      } else {
        endReveal();
      }
    });
  };
}
