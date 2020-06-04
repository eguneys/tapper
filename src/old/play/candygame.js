import * as mu from 'mutilz';
import { dContainer } from '../asprite';
import iPol from '../ipol';
import TapSprite from './tapsprite';
import { moveHandler, tapHandler, fxHandler, fxHandler2, hitTest } from './util';

import { allPos, allKeys, pos2key, cols } from '../candyutil';

export default function CandyGame(play, ctx, bs) {

  const { events } = ctx;

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

  const tileByEPos = epos => {
    for (let key in dTiles) {
      let tile = dTiles[key];
      if (hitTest(epos[0], epos[1], tile.bounds())) {
        return key;
      }
    }
    return null;
  };

  const handleMove = moveHandler({
    onBegin(epos) {},
    onUpdate(epos) {
      let key = tileByEPos(epos);

      if (key) {
        candy.updateTap(key);
      }
    },
    onEnd() {
      candy.endTap();
    }
  }, events);

  this.update = delta => {
    handleMove(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.bounds = () => container.getBounds();

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}

function CandyTile(play, ctx, bs) {

  const { events, textures: { mall } } = ctx;

  let bgAlpha = 0.5;
  let { bgMargin, fgMargin, bgW, fgW } = bs.tile;

  let dBg = new TapSprite(this, ctx, {
    width: bgW,
    height: bgW,
    texture: mall['tilebg']
  });

  let dFg = new TapSprite(this, ctx, {
    width: fgW,
    height: fgW
  });

  let dSelect = new TapSprite(this, ctx, {
    width: bgW,
    height: bgW,
    texture: mall['tileselect']
  });

  let iScale = new iPol(0, 0, { yoyo: 100000 });

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

    dSelect.add(container);
    dSelect.move(bgMargin * 0.5, bgMargin * 0.5);
    components.push(dSelect);
    dSelect.visible(false);
  };
  initContainer();

  let candy,
      key;

  let resource;
  let ground;
  let fxs;

  this.init = data => {
    key = data.key;
    candy = data.candy;
    ground = candy.data.ground[key];

    fxs = candy.data.fxs[key];
  };

  const updateTexture = () => {
    if (resource !== ground.resource) {
      resource = ground.resource;
      dFg.texture(mall[resource]);
    }
  };

  const handleTap = tapHandler(() => {
    candy.tap(key);
  }, events, () => container.getBounds());

  let collectsUpdate = false;
  const handleCollects = fxHandler({
    onBegin(collects) {
      let { keys } = collects;
      if (keys.includes(key)) {
        collectsUpdate = true;
      }
    },
    onUpdate(collects, i) {
      if (!collectsUpdate) { return; };

      let alpha = bgAlpha + 0.25 + (1.0 - bgAlpha + 0.25) * i;
      dBg.alpha(alpha);
    },
    onEnd() {
      if (!collectsUpdate) { return; };
      collectsUpdate = false;
      dBg.alpha(bgAlpha);
    },
  }, () => candy.data.collects);

  const handleSelected = fxHandler2({
    onBegin() {
      dSelect.visible(true);
      iScale.both(0, 1);
    },
    onUpdate() {
    },
    onEnd() {
      dSelect.visible(false);
      iScale.target(0);
      iScale.smoothstop();
    }
  }, () => fxs.selects);

  const updateScale = (delta) => {
    iScale.update(delta / 200);
  };

  this.update = delta => {
    handleSelected(delta);
    updateScale(delta);
    updateTexture();
    handleCollects(delta);
    handleTap(delta);
    components.forEach(_ => _.update(delta));
  };


  const renderVisible = () => {
    let fxs = candy.data.fxs[key];

    let visible = !ground.trail && !ground.empty && !fxs.falls;
    dFg.visible(visible);
  };

  const renderScale = () => {
    let vScale = iScale.value();

    let extendFactor = bs.margin * 2.0;

    let extendW = -extendFactor * vScale,
        extendH = extendW;


    selectScaleD(dFg,
                 fgMargin * 0.5,
                 fgMargin * 0.5,
                 fgW,
                 fgW,
                 extendW);

    selectScaleD(dSelect,
                 bgMargin * 0.5,
                 bgMargin * 0.5,
                 bgW,
                 bgW,
                 extendW);
                 

  };

  const selectScaleD = (dD, x, y, w, h, extend) => {
    dD.size(w + extend,
            h + extend);

    dD.move(x - extend * 0.5,
             y - extend * 0.5);
  };

  this.render = () => {
    renderVisible();
    renderScale();
    components.forEach(_ => _.render());
  };

  this.bounds = () => container.getBounds();

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
