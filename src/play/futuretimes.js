import { dContainer } from '../asprite';
import FutureRoom from './futureroom';
import FutureDogs from './futuredogs';

export default function FutureTimes(play, ctx, bs) {

  let dRoom = new FutureRoom(this, ctx, bs);

  let dDogs = new FutureDogs(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const createContainer = () => {
    dRoom.add(container);
    components.push(dRoom);

    dDogs.add(container);
    components.push(dDogs);
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

    dDogs.init({future});
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

    dDogs.init({future});
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
