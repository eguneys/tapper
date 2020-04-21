import * as mu from 'mutilz';
import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import { tapHandler, animHandler } from './util';

import { allPos, allKeys, pos2key, cols } from '../candyutil';

export default function CandyGame(play, ctx, bs) {

  let gameW = bs.game.width,
      tileW = Math.floor(gameW / cols);

  let dTiles = {};

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    allPos.forEach(pos => {
      let key = pos2key(pos);
      let dTile = new CandyTile(this, ctx, { tileW, ...bs });

      dTile.move(pos[0] * tileW,
                 pos[1] * tileW);

      dTile.add(container);
      components.push(dTile);

      dTiles[key] = dTile;
    });
  };
  initContainer();

  let candy;

  this.init = data => {
    candy = data.candy;

    allKeys.forEach(key => {
      dTiles[key].init({key, candy});
    });
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}

function CandyTile(play, ctx, bs) {

  const { events, textures: { mall } } = ctx;

  let bgAlpha = 0.5;
  let bgMargin = bs.margin;
  let fgMargin = bgMargin * 2.0;
  let bgW = bs.tileW - bgMargin;
  let fgW = bs.tileW - fgMargin;

  let dBg = new TapSprite(this, ctx, {
    width: bgW,
    height: bgW,
    texture: mall['tilebg']
  });

  let dFg = new TapSprite(this, ctx, {
    width: fgW,
    height: fgW
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    dBg.move(bgMargin * 0.5, bgMargin * 0.5);
    dBg.alpha(bgAlpha);
    components.push(dBg);

    dFg.add(container);
    dFg.move(fgMargin * 0.5, fgMargin * 0.5);
    components.push(dFg);
  };
  initContainer();

  let candy,
      key;

  let resource;

  this.init = data => {
    key = data.key;
    candy = data.candy;

    updateTexture();
  };

  const updateTexture = () => {
    let ground = candy.data.ground[key];
    dFg.texture(mall[ground.resource]);    
  };

  const handleTap = tapHandler(() => {
    candy.tap(key);
  }, events, () => container.getBounds());

  const handleCollects = animHandler({
    onBegin(collects) {
      let { keys } = collects;

      if (keys.includes(key)) {
        dFg.visible(false);
        return true;
      }
      return false;
    },
    onUpdate(collects, i) {
      let alpha = bgAlpha + 0.25 + (1.0 - bgAlpha + 0.25) * i;
      dBg.alpha(alpha);
    },
    onEnd() {
      dBg.alpha(0);
    }
  }, () => candy.data.collects);

  this.update = delta => {
    handleCollects(delta);
    handleTap(delta);
    components.forEach(_ => _.update(delta));
  };


  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
