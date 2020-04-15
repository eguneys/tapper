import { dContainer } from '../asprite';

export default function FutureTimes(play, ctx, bs) {

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  this.init = data => {
  };

  this.move = (x, y) => {
    container.position.set(x, y);
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
