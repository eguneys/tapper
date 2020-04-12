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

  const updateAdapter = (delta) => {
    adapter.update(delta);

    adapter.added().forEach(_ => {
      dScroll.addComponent(_);      
    });


    adapter.removed().forEach(_ => {
      dScroll.removeComponent(_);
    });
  };

  this.move = (x, y) => {
    dScroll.move(x, y);
  };

  this.add = (parent) => {
    parent.addChild(container);
    return container;
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    updateAdapter(delta);

    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
