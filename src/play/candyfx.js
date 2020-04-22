import Pool from 'poolf';
import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import { animHandler } from './util';

import { allKeys, key2pos, cols } from '../candyutil';

export default function CandyFx(play, ctx, bs) {

  const { textures: { mall } } = ctx;

  let { tileW, bgMargin, fgMargin, bgW, fgW } = bs.tile;

  let pCollects = new Pool(() => new TapSprite(this, ctx, {
    width: bgW,
    height: bgW
  }));

  let dFalls = allKeys.map(key => new FallFx(this, ctx, {
    ...bs,
    key
  }));

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dFalls.forEach(_ => {
      _.add(container);
      components.push(_);
    });
  };
  initContainer();

  let candy;
  this.init = data => {
    candy = data.candy;

    dFalls.forEach(_ => _.init({candy}));
  };

  let targetPoss = {
    wood: {
      x: 0,
      y: 0
    },
    gold: {
      x: 0,
      y: bs.resource.height + bs.margin
    },
    food: {
      x: 0,
      y: (bs.resource.height + bs.margin) * 2.0
    }
  };

  let targetSize = {
    w: bs.resource.height,
    h: bs.resource.height
  };
  let targetPos;
  const handleCollects = animHandler({
    onBegin(collects) {
      let { keys, resource } = collects;

      targetPos = targetPoss[resource];

      keys.forEach(key => {
        let pos = key2pos(key);

        let x = pos[0] * tileW,
            y = pos[1] * tileW;

        x += bs.game.x,
        y += bs.game.y;

        pCollects.acquire(_ => {
          _.init({ x, y });
          _.move(x, y);
          _.texture(mall[resource]);
          _.add(container);
        });
      });

      return true;
     },
    onUpdate(collects, i) {
      pCollects.each(_ => {
        let { x, y } = _.data();

        let newX = x + (targetPos.x - x) * i,
            newY = y + (targetPos.y - y) * i;

        _.move(newX, newY);

        let newW = bgW + (targetSize.w - bgW) * i;

        _.size(newW, newW);
      });
    },
    onEnd() {
      pCollects.each(_ => {
        _.remove();
      });
      pCollects.releaseAll();
    }
  }, () => candy.data.collects);

  this.update = delta => {
    handleCollects(delta);
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

function FallFx(play, ctx, bs) {

  const { textures: { mall } } = ctx;

  let { key } = bs;

  let { tileW, bgMargin, fgMargin, bgW, fgW } = bs.tile;

  let pos = key2pos(key);

  const calculateTilePos = (pos) => {
    let x = pos[0] * tileW,
        y = pos[1] * tileW;

    x += bs.game.x,
    y += bs.game.y;

    return {x,y};    
  };

  let tilePos = calculateTilePos(key2pos(key));

  let dFg = new TapSprite(this, ctx, {
    width: fgW,
    height: fgW
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dFg.add(container);
    components.push(dFg);
  };
  initContainer();

  let fx;
  let candy;
  this.init = data => {
    candy = data.candy;
    fx = candy.data.fxs[key];
  };

  const handleFalls = animHandler({
    onBegin({to, resource}) {
      dFg.visible(true);
      dFg.texture(mall[resource]);
      dFg.move(tilePos.x, tilePos.y);
      return true;
    },
    onUpdate({to}, i) {
      let toPos = calculateTilePos(key2pos(to));

      let newX = tilePos.x + (toPos.x - tilePos.x) * i,
          newY = tilePos.y + (toPos.y - tilePos.y) * i;
      dFg.move(newX, newY);
      
    },
    onEnd() {
      dFg.visible(false);
    }
  }, () => fx.falls);

  this.update = delta => {
    handleFalls(delta);
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
