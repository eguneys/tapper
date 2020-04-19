import { makeId } from './util';
import { objFind, objForeach } from './util2';
import { randomFloor, pos2key } from './futureutil';

const dogId = makeId('dogs');

export default function FutureDogs(future, collider, bs) {

  let dogs;

  this.init = () => {
    dogs = {};

    place(randomFloor());
  };

  this.dogs = () => dogs;

  this.hit = pos => {
    let key = pos2key(pos);
    let dog = dogs[key];

    if (dog && dog.alive === true) {

      if (future.random()) {
        dog.crab = false;
        dog.alive = false;
      } else {
        place(randomFloor());
      }

    }
  };

  const place = pos => {
    let key = pos2key(pos);
    dogs[key] = {
      id: dogId(),
      crab: true,
      alive: true
    };

    collider.addRectangle(dogs[key], {
      x: pos[0] * bs.tileSize.width,
      y: pos[1] * bs.tileSize.height,
      w: bs.tileSize.width,
      h: bs.tileSize.height
    });
  };

  const vision = () => {
    objForeach(dogs, (key, dog) => {
      dog.alive = 'vision';
      dog.vision = true;
      dog.crab = false;
    });
  };

  const updateDogs = () => {


    let alive = objFind(dogs, (key, { alive }) => alive);
    if (!alive) {
      vision();
    }

    objForeach(dogs, (key, dog) => {
      if (dog.pickup) {
        dog.pickup = false;
        dog.alive = 'pickup';
        dog.vision = false;
        future.addVision();
      }
    });
  };


  this.update = delta => {
    updateDogs();
  };

}
