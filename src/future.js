import Crab from './crab';
import FutureTimes from './futuretime';

export default function Future(bs) {

  let crab = this.crab = new Crab(this, bs);
  let times = this.times = new FutureTimes(this, bs);

  this.time = times.time;
  this.vision = times.vision;
  this.tiles = times.tiles;
  this.collider = times.collider;

  this.init = (data) => {

    times.init({});

  };

  let userMove;

  this.userMove = (dirs) => {
    if (dirs) {
      userMove = dirs;
    }
    return userMove;
  };

  this.update = delta => {
    crab.update(delta);
    times.update(delta);
  };

}

