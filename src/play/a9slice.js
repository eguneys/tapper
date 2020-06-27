import AContainer from './acontainer';
import ASprite from './asprite';

export default function A9Slice(play, ctx, bs) {

  const makeSprite = (bounds, texture) => {
    return new ASprite(this, ctx, {
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

  let container = this.container = new AContainer();
  const initContainer = () => {

    dSs.forEach(_ => container.addChild(_));
    
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
