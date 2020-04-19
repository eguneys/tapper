import Crab from './crab';
import FutureTimes from './futuretimes';
import FutureShoots from './futureshoots';

export default function Future(bs) {

  let crab = this.crab = new Crab(this, bs);
  let times = this.times = new FutureTimes(this, bs);
  let shoots = new FutureShoots(this, bs);

  let message;

  this.time = times.time;
  this.vision = times.vision;
  this.tiles = times.tiles;
  this.collider = times.collider;
  this.dogs = times.dogs;

  this.shoots = () => shoots.shoot();

  this.init = (data) => {

    times.init({});
    shoots.init({});

    this.message('space to shoot,\n arrow keys to move');

  };

  this.message = (msg) => {
    if (msg) {
      message = {
        text: msg.toUpperCase()
      };
    }
    return message;
  };

  const randomTimes = [
    0.4,
    0.5,
    0.6,
    0.7,
    0.8,
    0.7,
    0.6,
    0.5,
    0.4
  ];
  this.random = () => {
    let time = this.time();
    
    console.log(time);
    return Math.random() < randomTimes[time];
  };

  this.shoot = (x, y) => {
    shoots.shoot(x, y);
    times.hit([x, y]);
  };

  this.addVision = () => {
    this.message("Vision");
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
    if (message) {
      if (!message.handled) {
        message.handled = true;
      } else {
        message = undefined;
      }
    }
    crab.update(delta);
    times.update(delta);
    shoots.update(delta);
  };

}

