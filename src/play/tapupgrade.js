import Pool from 'poolf';

import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import TapButton from './tapbutton';
import Tap9 from './tap9';
import TapText from './taptext';
import TapList from './taplist';
import ipol from '../ipol';

export default function TapUpgrade(play, ctx, bs) {

  const { textures } = ctx;

  let marginX = 6;
  let marginY = 8;
  let upgradeHeight = bs.menuUpgrade.height,
      upgradeWidth = bs.menu.width * 0.5 - marginX * 3.0;

  let upgradeAdapter = new UpgradeAdapter(this, ctx, bs);

  let dList = new TapList(this, ctx, {
    width: bs.menu.width,
    height: bs.menu.height - 40,
    adapter: upgradeAdapter
  });

  let dBg = new Tap9(this, ctx, {
    width: bs.menu.width,
    height: bs.menu.height,
    tileWidth: bs.menuClose.width,
    textures: textures['menubg9']
  });
  
  let dClose = new TapButton(this, ctx, {
    width: bs.menuClose.width,
    height: bs.menuClose.height,
    textures: [textures['menuclose'],
               textures['menuclose']],
    onClick: onCloseClick
  });

  let iFadeIn = new ipol(1, 1, {});

  function onCloseClick() {
    play.toggleUpgradeMenu();
  };

  const dScrollComponents = () => {

    comp.init({upgrade});
    dScroll.addComponent(comp);

    
    let x = marginX * 3.0 + 
        (i % 2) * (upgradeWidth + marginX),
        y = marginY * 5.0 + 
        Math.floor(i / 2) * (upgradeHeight + marginY);
    comp.move(x, y);
  };

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);
    dBg.move(bs.menu.x,
             bs.menu.y);


    dClose.add(container);
    components.push(dClose);
    dClose.move(bs.menuClose.x,
                bs.menuClose.y);

    dList.add(container);
    components.push(dList);
    dList.move(bs.menu.x,
               bs.menu.y + 20);
  };
  initContainer();

  let isOpen = false;

  let tapper;

  this.init = data => {
    tapper = data.tapper;

    upgradeAdapter.init(tapper);

    dBg.init({});
    dClose.init({});
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.toggle = () => {
    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  let closing;
  this.open = () => {
    isOpen = true;
    container.visible = true;
    iFadeIn.both(1, 0);
  };

  this.close = () => {
    isOpen = false;
    iFadeIn.both(0, 1);
    closing = true;
  };

  const doClose = () => {
    closing = false;
    container.visible = false;
  };

  this.update = delta => {
    iFadeIn.update(delta * 0.1);

    if (closing && iFadeIn.settled()) {
      doClose();
    }

    components.forEach(_ => _.update(delta));
  };

  const leftOffset = bs.menu.width + bs.menu.x;

  this.render = () => {
    let vFadeIn = iFadeIn.value();
    container.position.set(-vFadeIn * leftOffset, 0);

    components.forEach(_ => _.render());
  };

}

function UpgradeAdapter(play, ctx, bs) {

  let model;
  
  this.init = data => {
    model = data.upgrades;
  };

}

function Upgrade(play, ctx, bs) {

  const { textures } = ctx;

  let dBg = new Tap9(this, ctx, {
    width: bs.width,
    height: bs.height,
    tileWidth: 16,
    textures: textures['upgradebg9']
  });

  let dLevel = new TapText(this, ctx, {
    size: bs.width * 0.2,
    textures: textures['letters']
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    container.position.set(bs.x, bs.y);
    dBg.add(container);
    components.push(dBg);

    dLevel.add(container);
    components.push(dLevel);
  };
  initContainer();

  let upgrade;

  this.init = data => {
    upgrade = data.upgrade;

    dBg.init({});

    dLevel.init({});
    dLevel.setText('LV.9/10');
  };

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.add = (parent) => {
    parent.addChild(container);
    return container;
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
