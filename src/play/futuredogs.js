import { objMap } from '../util2';
import { dContainer } from '../asprite';
import PoolPlus from './poolplus';
import TapSprite from './tapsprite';
import { key2pos } from '../futureutil';

export default function FutureDogs(play, ctx, bs) {

  let pDogs = new PoolPlus(() => new FutureDog(this, ctx, {
    width: bs.tileSize.width,
    height: bs.tileSize.height }));

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  let future;
  this.init = data => {
    future = data.future;

    pDogs.each(_ => _.remove());
    pDogs.releaseAll();
  };

  const updateDogs = () => {
    let dogs = future.dogs();

    objMap(dogs, (key, dog) => {
      let pos = key2pos(key);
      let dDog = pDogs.getOrAcquire(dog.id, _ => {
        _.init(dog);
        _.add(container);
        _.move(pos[0] * bs.tileSize.width,
               pos[1] * bs.tileSize.height);
      });

      dDog.alive(dog.alive);
    });
  };

  this.update = delta => {
    updateDogs();
    pDogs.each(_ => _.update(delta));
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    pDogs.each(_ => _.render());
    components.forEach(_ => _.render());
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
}

function FutureDog(play, ctx, bs) {

  const { textures } = ctx;

  const dogsTextures = textures['mall']['items']['dogs'],
        aliveTexture = dogsTextures['alive'],
        deadTexture = dogsTextures['dead'],
        visionTexture = dogsTextures['vision'];
  

  let dBody = new TapSprite(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBody.add(container);
    components.push(dBody);
  };
  initContainer();

  let alive;
  this.init = data => {
    alive = data.alive;
  };

  this.alive = (_alive) => {
    if (alive !== _alive) {
      alive = _alive;
    }
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
    if (alive) {
      dBody.texture(aliveTexture);
    } else if (!alive) {
      dBody.texture(deadTexture);
    }
    if (alive === 'vision') {
      dBody.texture(visionTexture);
    }

    components.forEach(_ => _.render());
  };
}
