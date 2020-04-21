import { rect } from '../dquad/geometry';
import { dContainer, sprite } from '../asprite';

import CandyView from './candy';

export default function Play(ctx) {

  const { textures, canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    let margin = width * 0.01;

    let resourceW = width * 0.6,
        resourceH = height * 0.05;

    let resource = rect(margin, margin,
                        resourceW,
                        resourceH);

    let gameW = (width - margin * 2);
    let gameX = (width - gameW) * 0.5,
        gameY = (resourceH + margin) * 3 + margin * 3;
    let game = rect(gameX, gameY,
                    gameW,gameW);
                    

    return {
      margin,
      game,
      resource,
      width,
      height
    };
  })();

  let dCandy = new CandyView(this, ctx, bs);

  let components = [];
  let container = dContainer();
  const initContainer = () => {

    dCandy.add(container);
    components.push(dCandy);

  };
  initContainer();

  this.init = data => {

    dCandy.init({});

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
