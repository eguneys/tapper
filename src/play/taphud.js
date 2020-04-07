import { dContainer } from '../asprite';
import TapSprite from './tapsprite';

export default function TapHud(play, ctx, bs) {

  const { textures } = ctx;

  const container = dContainer();

  let components = [];

  let dBg = new TapSprite(this, ctx, {
    x: 0,
    y: 0,
    width: bs.width,
    height: bs.height,
    texture: textures['hud']
  });

  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);
  };
  initContainer();

  this.init = data => {
    dBg.init({});
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
