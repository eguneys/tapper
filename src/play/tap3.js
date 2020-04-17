import { dContainer } from '../asprite';

import TapSprite from './tapsprite';

export default function Tap3(play, ctx, bs) {

  const makeSprite = (bounds, texture) => {
    return new TapSprite(this, ctx, {
      ...bounds,
      texture
    });
  };

  let { width, height, tileWidth, textures } = bs;

  function bounds(width, height, tileWidth) {

    let tileHeight = bs.tileHeight || tileWidth;

    let midWidth = width - tileWidth * 2.0,
        midHeight = height - tileHeight * 2.0;

    let baseX = 0,
        baseY = 0;

    let bSs = [{
      x: baseX,
      y: baseY,
      width: tileWidth,
      height: tileHeight
    }, {
      x: baseX + tileWidth,
      y: baseY,
      width: midWidth,
      height: tileHeight
    }, {
      x: baseX + tileWidth + midWidth,
      y: baseY,
      width: tileWidth,
      height: tileHeight
    }];

    return bSs;
  };

  let bSs = bounds(width, height, tileWidth);
  let dSs = bSs.map((bounds, i) => 
    makeSprite(bounds, textures[i]));

  this.size = (width, height, tileWidth) => {
    let bSs = bounds(width, height, tileWidth);
    dSs.forEach((_, i) => {
      let bs = bSs[i];
      _.size(bs.width, bs.height);
      _.move(bs.x, bs.y);
    });
  };

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dSs.forEach(_ => {
      _.add(container);
      components.push(_);
    });
  };
  initContainer();

  this.init = data => {
    dSs.forEach(_ => _.init({}));
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };
}
