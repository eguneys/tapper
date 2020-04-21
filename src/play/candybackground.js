import { dContainer } from '../asprite';

import TapSprite from './tapsprite';

export default function CandyBackground(play, ctx, bs) {

  const { textures } = ctx;

  let dBg = new TapSprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: textures['mbg']
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);
  };
  initContainer();

  this.init = data => {
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
