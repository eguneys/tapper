import { objMap } from './util2';

import * as fu from './futureutil';
import FutureCollider from './futurecollider';
import FutureDogs from './futuredogs';

const { 
  NbFutureTimes,
  middleX,
  middleY,
  rightX,
  leftX,
  key2pos,
  pos2key } = fu;


export default function FutureTimes(future, bs) {

  let tileWidth = bs.tileSize.width,
      tileHeight = bs.tileSize.height,
      crabWidth = tileWidth;

  const Time2000 = new FutureTime(future, bs),
        Time2005 = new FutureTime(future, bs),
        Time2010 = new FutureTime(future, bs),
        Time2015 = new FutureTime(future, bs),
        Time2020 = new FutureTime(future, bs),
        Time2025 = new FutureTime(future, bs),
        Time2030 = new FutureTime(future, bs),
        Time2035 = new FutureTime(future, bs),
        Time2040 = new FutureTime(future, bs);

  const times = [
    Time2000,
    Time2005,
    Time2010,
    Time2015,
    Time2020,
    Time2025,
    Time2030,
    Time2035,
    Time2040
  ];

  let time,
      vision;

  this.time = () => time;
  this.vision = () => vision;
  this.tiles = () => times[time].tiles;
  this.collider = () => times[time].collider;
  this.dogs = () => times[time].dogs();

  this.hit = (...args) => times[time].hit(...args);

  this.addVision = () => {
    console.log(vision);
    vision++;
  };

  this.init = () => {

    time = 4;
    vision = 0;

    initTime();
    future.crab.init({ pos: [middleX, middleY] });
  };

  const initTime = () => {
    times[time].init({});
  };

  const travelPast = () => {
    if (time === 0 || vision <= 0) {
      return false;
    }
    time--;
    vision--;

    initTime();
    future.crab.init({ pos: [rightX, middleY] });
    return true;
  };

  const travelFuture = () => {
    if (time === NbFutureTimes - 1 || vision <= 0) {
      return false;
    }
    time++;
    vision--;

    initTime();
    future.crab.init({ pos: [leftX, middleY] });
    return true;
  };

  const travelUpdate = () => {
    let crabPos = future.crab.pos();

    if (crabPos[0] * tileWidth < 0) {
      if (!travelPast()) {
        future.message('No vision to travel past,\n come back');
      }
    } else if (crabPos[0] * tileWidth + crabWidth > bs.width) {
      if (!travelFuture()) {
        future.message('No vision to travel future,\n come back');
      }
    }
  };

  this.update = delta => {
    travelUpdate();
    times[time].update(delta);
  };
}

function FutureTime(future, bs) {

  let tileWidth = bs.tileSize.width,
      tileHeight = bs.tileSize.height;

  let collider = this.collider = new FutureCollider({x: 0,
                                                     y: 0, 
                                                     width: bs.width,
                                                     height: bs.height});

  let tiles = this.tiles = fu.Blueprint();
  let dogs = new FutureDogs(future, collider, bs);
  
  this.dogs = () => dogs.dogs();
  this.hit = dogs.hit;

  this.init = () => {
    initCollider();
    dogs.init({});
  };

  const initCollider = () => {
    objMap(tiles, (key, tile) => {
      let pos = key2pos(key);

      collider.addRectangle(tile.collides, {
        x: pos[0] * tileWidth,
        y: pos[1] * tileHeight,
        w: tileWidth,
        h: tileHeight
      });
    });
  };

  this.update = delta => {
    collider.update();
    dogs.update(delta);
  };

}
