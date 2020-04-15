import Pool from 'poolf';
import { dContainer } from '../asprite';
import { Tiles, key2pos } from '../future';

import TapSprite from './tapsprite';

export default function FutureRoom(play, ctx, bs) {

  let tiles = new Pool(() => new RoomTile(this, ctx, {
    width: bs.tileSize.width,
    height: bs.tileSize.height
  }));

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  let future;

  this.init = data => {
    future = data.future;

    acquireTiles();
  };

  const acquireTiles = () => {
    let { time } = future.state();

    tiles.each(_ => _.remove());

    tiles.releaseAll();

    for (let tileKey in future.tiles) {
      let pos = key2pos(tileKey);
      let tile = future.tiles[tileKey];
      tiles.acquire(_ => {
        _.init({ 
          tile,
          time
        });
        _.add(container);
        _.move(pos[0] * bs.tileSize.width,
               pos[1] * bs.tileSize.height);
      });
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
    components.forEach(_ => _.render());
  };
}

const tileTextureByType = {
  [Tiles.topleft]: 'topleft',
  [Tiles.topright]: 'topright',
  [Tiles.bottomleft]: 'bottomleft',
  [Tiles.bottomright]: 'bottomright',
  [Tiles.top]: 'top',
  [Tiles.bottom]: 'bottom',
  [Tiles.left]: 'left',
  [Tiles.right]: 'right',
  [Tiles.leftdoor]: 'leftdoor',
  [Tiles.rightdoor]: 'rightdoor',
  [Tiles.floor]: 'floor',
  [Tiles.floor2]: 'floor2'
};

const roomKeyByTime = {
  0: 'room0',
  4: 'room4'
};

function RoomTile(play, ctx, bs) {

  const { textures } = ctx;

  let dBody = new TapSprite(this, ctx, {
    width: bs.width,
    height: bs.height
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBody.add(container);
    components.push(dBody);
  };
  initContainer();

  let tile;

  this.init = data => {
    tile = data.tile;

    let time = data.time;

    let roomTextures = textures['mall']['rooms'][roomKeyByTime[time]];

    dBody.texture(roomTextures[tileTextureByType[tile.type]]);
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
    components.forEach(_ => _.render());
  };
}
