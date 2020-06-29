import * as mu from 'mutilz';
import * as math from './math';
import iPol from '../ipol';
import { withDelay } from '../util';
import Pool from 'poolf';
import AContainer from './acontainer';
import A9Slice from './a9slice';
import ASprite from './asprite';
import AAnimated from './aanimated';
import Fipps from './fippstext';
import CButton from './cbutton';
import AHContainer from './ahcontainer';
import AVContainer from './avcontainer';

import { callMaybe } from './util';

export default function CGameOver(play, ctx, bs) {

  const { textures } = ctx;

  const mscreen = textures['mscreen'];

  let shineW = bs.text.p;

  let bWidth = bs.width * 0.7,
      bHeight = bs.height * 0.7;
  let shineY = bHeight * 0.95 - shineW;

  let pShines = new Pool(() => 
    new ShineSpades(this, ctx, {
      width: shineW,
      height: shineW
    }));

  let dHeader = new Fipps(this, ctx, {
    label: 'Game Over',
    fill: 0xac3232,
    size: bs.text.h1
  });

  let dBody = new Fipps(this, ctx, {
    label: bs.content,
    size: bs.text.p
  });

  let dHeaderBodyContainer = new AVContainer(this, ctx, {
    contents: [dHeader, dBody]
  });

  let dBg = new ASprite(this, ctx, {
    width: bWidth,
    height: bHeight,
    texture: mscreen['menubg']
  });

  let dNewGame = new CButton(this, ctx, {
    label: 'New Game',
    width: bWidth * 0.2,
    height: bHeight * 0.2,
    onTap() {
      callMaybe(bs.onNewGame);
    }
  });

  let dMainMenu = new CButton(this, ctx, {
    label: 'Main Menu',
    width: bWidth * 0.2,
    height: bHeight * 0.2,
    onTap() {
      callMaybe(bs.onMainMenu);
    }
  });

  let dButtonsContainer = new AHContainer(this, ctx, {
    contents: [dMainMenu, dNewGame],
    gap: bs.width * 0.1
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);

    container.addChild(dHeaderBodyContainer);
    dHeader.container.hcenter(bWidth);
    dBody.container.hcenter(bWidth);

    container.addChild(dBody);
    dBody.container.hcenter(bWidth);

    dButtonsContainer.container.hcenter(bWidth);
    container.addChild(dButtonsContainer);
    dButtonsContainer.container.bottom(shineY - bs.uiMargin);
  };
  initContainer();

  const addShine = (x, y) => {
    let poskey = `${x}.${y}`;

    let shinePoss = pShines.map(_ => _.poskey);

    if (shinePoss.includes(poskey)) {
      return;
    }

    let dShine = pShines.acquire(_ => _.init());

    dShine.container.move(x, y);
    container.addChild(dShine);

    dShine.poskey = poskey;
  };

  this.init = (data) => {
    
  };

  this.releaseShine = shine => {
    container.removeChild(shine);
    pShines.release(shine);
  };

  const maybeAddShine = withDelay(() => {
    addShine(bWidth * 0.1 +
             Math.floor(mu.randInt(0, bWidth * 0.8) / shineW) * 
             shineW,
             shineY);
  }, 200, {});

  this.update = delta => {
    maybeAddShine(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function ShineSpades(play, ctx, bs) {

  const { textures } = ctx;
  const mspades = textures['mscreen'].spades;

  let dBody = new AAnimated(this, ctx, {
    width: bs.width,
    height: bs.height,
    animations: {
      'shine': {
        textures: mspades['shine'],
        duration: 300,
        loop: 99999
      }
    }
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBody);
  };
  initContainer();

  let iLife = new iPol(0, 0, {});

  this.init = () => {
    iLife.both(0, 1);
    // dBody.play('shine');
  };

  const maybeKill = () => {
    if (iLife.settled()) {
      play.releaseShine(this);
    }
  };

  this.update = delta => {
    maybeKill();
    iLife.update(delta / 1000);
    this.container.update(delta);
  };

  this.render = () => {
    let vLife = iLife.value();

    let alpha = 1.0 - vLife;

    alpha = math.round(alpha, 0.3);

    dBody.alpha(0.5 + alpha * 0.5);

    this.container.render();
  };
}
