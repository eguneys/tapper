import { dContainer } from '../asprite';
import FutureRoom from './futureroom';

export default function FutureTimes(play, ctx, bs) {

  let dRoom = new FutureRoom(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const createContainer = () => {
    dRoom.add(container);
    components.push(dRoom);
  };
  createContainer();

  let future;
  this.init = data => {
    future = data.future;

    dRoom.init({
      time: future.time(),
      tiles: future.tiles()
    });
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
