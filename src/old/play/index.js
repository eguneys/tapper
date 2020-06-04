import { dContainer, sprite } from '../asprite';

import CardGameView from './cardgame';

export default function Play(ctx) {

  const { textures, canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    return {
      width,
      height
    };
  })();

  let dCardGame = new CardGameView(this, ctx, bs);

  let components = [];
  let container = dContainer();
  const initContainer = () => {

    dCardGame.add(container);
    components.push(dCardGame);

  };
  initContainer();

  this.init = data => {

    dCardGame.init({});

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
