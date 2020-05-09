import { dContainer, sprite } from '../asprite';

import CandyView from './candy';
import SolitaireView from './solitaire';

export default function Play(ctx) {

  const { textures, canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    return {
      width,
      height
    };
  })();

  let dCandy = new CandyView(this, ctx, bs);
  let dSolitaire = new SolitaireView(this, ctx, bs);

  let components = [];
  let container = dContainer();
  const initContainer = () => {

    dSolitaire.add(container);
    components.push(dSolitaire);

  };
  initContainer();

  this.init = data => {

    dSolitaire.init({});

  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
