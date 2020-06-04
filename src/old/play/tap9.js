import { dContainer } from '../asprite';

import { combineRect } from './util';
import TapSprite from './tapsprite';

export default function Tap9(play, ctx, bs) {

  const makeSprite = (bounds, texture) => {
    return new TapSprite(this, ctx, {
      ...bounds,
      texture
    });
  };

  let { width, height, tileWidth, textures } = bs;

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
  }, {
    x: baseX,
    y: baseY + tileHeight,
    width: tileWidth,
    height: midHeight
  }, {
    x: baseX + tileWidth,
    y: baseY + tileHeight,
    width: midWidth,
    height: midHeight    
  }, {
    x: baseX + tileWidth + midWidth,
    y: baseY + tileHeight,
    width: tileWidth,
    height: midHeight
  }, {
    x: baseX,
    y: baseY + tileHeight + midHeight,
    width: tileWidth,
    height: tileHeight
  }, {
    x: baseX + tileWidth,
    y: baseY + tileHeight + midHeight,
    width: midWidth,
    height: tileHeight
  }, {
    x: baseX + tileWidth + midWidth,
    y: baseY + tileHeight + midHeight,
    width: tileWidth,
    height: tileHeight
  }];

  let dSs = bSs.map((bounds, i) => 
    makeSprite(bounds, textures[i]));

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

  this.bounds = () => dSs
    .map(_ => _.bounds())
    .reduce((acc, dS) => 
      combineRect(acc, dS));

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };
}
