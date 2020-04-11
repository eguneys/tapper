import { dContainer } from '../asprite';
import TapScroll from './tapscroll';

export default function TapList(play, ctx, bs) {

  let adapter = bs.adapter;

  let dScroll = new TapScroll(this, ctx, {
    width: bs.width,
    height: bs.height
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dScroll.add(container);
    components.push(dScroll);
  };
  initContainer();

  this.init = data => {
    dScroll.init({});
  };

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.add = (parent) => {
    parent.addChild(container);
    return container;
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
