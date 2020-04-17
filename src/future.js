import Crab from './crab';
import FutureTimes from './futuretimes';
import FutureShoots from './futureshoots';

export default function Future(bs) {

  let crab = this.crab = new Crab(this, bs);
  let times = this.times = new FutureTimes(this, bs);
  let shoots = new FutureShoots(this, bs);

  this.time = times.time;
  this.vision = times.vision;
  this.tiles = times.tiles;
  this.collider = times.collider;
  this.dogs = times.dogs;

  this.shoots = () => shoots.shoot();

  this.init = (data) => {

    times.init({});
    shoots.init({});

  };

  this.random = () => {
    return Math.random() < 0.8;
  };

  this.shoot = (x, y) => {
    shoots.shoot(x, y);
    times.hit([x, y]);
  };

  this.addVision = () => {
    times.addVision();
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
    shoots.update(delta);
  };

}

