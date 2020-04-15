import { dContainer } from '../asprite';
import TapSprite from './tapsprite';

import { Facing } from '../futureutil';

const crabFrame =  crab => {
  let facing = crab.facing();

  return facing;
};

export default function FutureCrab(play, ctx, bs) {

  const { textures } = ctx;
  const crabTextures = textures['mall']['items']['crab'];

  let dBody = new TapSprite(this, ctx, {
    width: bs.tileSize.width,
    height: bs.tileSize.height
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBody.add(container);
    components.push(dBody);
  };
  initContainer();

  let future;

  this.init = data => {
    future = data.future;
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

    let crab = future.crab,
        state = crab.state(),
        pos = crab.pos();

    this.move(pos[0] * bs.tileSize.width,
              pos[1] * bs.tileSize.height);


    let texture = crabTextures[crabFrame(crab)];
    dBody.texture(texture);

    components.forEach(_ => _.render());
  };
}
