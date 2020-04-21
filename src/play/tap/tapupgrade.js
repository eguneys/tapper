import Pool from 'poolf';

import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import TapButton from './tapbutton';
import Tap9 from './tap9';
import FText from './ftext';
import TapList from './taplist';
import TapCostButton from './tapcostbutton';
import ipol from '../ipol';

export default function TapUpgrade(play, ctx, bs) {

  const { textures } = ctx;

  let marginX = 6;
  let marginY = 8;
  let upgradeHeight = bs.menuUpgrade.height,
      upgradeWidth = bs.menu.width - marginX * 3.0;

  let upgradeAdapter = new UpgradeAdapter(this, ctx, {
    marginX,
    marginY,
    upgradeWidth,
    upgradeHeight
  });

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
    dList.move(bs.menu.x + 10,
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
    dList.init({});
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

  let { marginX, marginY, upgradeWidth, upgradeHeight } = bs;

  let model;

  let pool = new Pool(() => new Upgrade(play, ctx, {
    width: upgradeWidth,
    height: upgradeHeight
  }));

  let dViews = {},
      lAdded,
      lRemoved;
  
  this.init = data => {
    model = data.upgrades();
  };

  this.added = () => lAdded;
  this.removed = () => lRemoved;

  this.update = (delta) => {

    let newRemoved = dViews,
        newViews = {},
        newAdded = [];

    for (let i = 0; i < model.length; i++) {
      let upgrade = model[i];
      let comp = dViews[upgrade.key];

      if (!comp) {
        comp = pool.acquire(_ => {
          _.init({upgrade});
        });
        newAdded.push(comp);
      } else {
        delete newRemoved[upgrade.key];
      }
      newViews[upgrade.key] = comp;

      let x = 0,
          y = i * (upgradeHeight + marginY);
      comp.move(x, y);
    }

    lRemoved = Object.values(newRemoved);
    lAdded = newAdded;
    dViews = newViews;
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

  let dLevel = new FText(this, ctx, {
    size: bs.width * 0.05,
    texture: textures['fletters'],
    kerning: textures['fkerning']
  });

  let dCostButton = new TapCostButton(this, ctx, {
    width: bs.width * 0.4,
    height: bs.height - 8,
    onClick: onUpgradeClick
  });


  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);

    dLevel.add(container);
    components.push(dLevel);
    dLevel.move(4, 4);

    let costBounds = dCostButton.bounds();
    dCostButton.move(bs.width - costBounds.width - 4,
                     bs.height - costBounds.height - 4);
    dCostButton.add(container);
    components.push(dCostButton);
  };
  initContainer();

  let upgrade;

  this.init = data => {
    upgrade = data.upgrade;

    dBg.init({});
    dLevel.init({});
    dCostButton.init({upgrade});

    dLevel.setText(`LV.${upgrade.level}`);
  };

  function onUpgradeClick() {
    console.log(upgrade);
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
