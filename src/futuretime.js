import { objMap } from './util2';

import * as fu from './futureutil';
import FutureCollider from './futurecollider';

const { 
  NbFutureTimes,
  middleX,
  middleY,
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

  this.init = () => {

    time = 4;
    vision = 0;

    future.crab.init({ pos: [middleX, middleY] });
  };
  


  const travelPast = () => {

  };

  const travelFuture = () => {

  };

  const travelUpdate = () => {
    let crabPos = future.crab.pos();

    if (crabPos[0] * tileWidth < 0) {
      travelPast();
    } else if (crabPos[0] * tileWidth + crabWidth > bs.width) {
      travelFuture();
    }
  };

  this.update = delta => {
    travelUpdate();
  };
}

function FutureTime(future, bs) {

  let tileWidth = bs.tileSize.width,
      tileHeight = bs.tileSize.height;

  let collider;
  let tiles = fu.Blueprint();

  this.init = () => {
    initCollider();
  };

  const initCollider = () => {

    collider = this.collider = new FutureCollider({x: 0,
                                                   y: 0, 
                                                   width: bs.width,
                                                   height: bs.height});

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
  };

}
