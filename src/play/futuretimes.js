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

  let time;

  this.init = data => {
    future = data.future;

    time = future.time();

    dRoom.init({
      time: time,
      tiles: future.tiles()
    });
  };

  const travelPast = () => {
    travelBase();
  };

  const travelFuture = () => {
    travelBase();
  };

  const travelBase = () => {
    dRoom.init({
      time: time,
      tiles: future.tiles()
    });
  };

  const updateTransition = delta => {

    let oldTime = time,
        newTime = future.time();

    time = newTime;

    if (newTime < oldTime) {
      travelPast();
    } else if (newTime > oldTime) {
      travelFuture();
    }
  };


  this.update = delta => {
    updateTransition(delta);

    components.forEach(_ => _.update(delta));
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


  this.render = () => {
    components.forEach(_ => _.render());
  };
}
