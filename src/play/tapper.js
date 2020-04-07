import { dContainer } from '../asprite';
import TapHud from './taphud';

export default function Play(play, ctx, bs) {

  const { textures } = ctx;

  let container = dContainer();

  let dHud = new TapHud(this, ctx, bs);

  let components = [];

  const initContainer = () => {
    dHud.add(container);
    components.push(dHud);
  };
  initContainer();

  this.init = data => {
    dHud.init({});
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
