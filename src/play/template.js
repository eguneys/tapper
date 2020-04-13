import { dContainer } from '../asprite';

export default function Play(play, ctx) {

  let components = [];
  const container = dContainer();
  const initContainer = () => {
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

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };
}
