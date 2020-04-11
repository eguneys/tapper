import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import TapButton from './tapbutton';

export default function TapHud(play, ctx, bs) {

  const { textures } = ctx;

  const container = dContainer();

  let components = [];

  let dBg = new TapSprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: textures['hud']
  });

  let dUpgrade = new TapButton(this, ctx, {
    width: bs.upgrade.width,
    height: bs.upgrade.height,
    textures: [textures['toggleOn'],
               textures['toggleOff']],
    icon: textures['iconUpgrade'],
    onClick: onUpgradeClick
  });

  function onUpgradeClick() {
    play.toggleUpgradeMenu();
  }

  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);

    dUpgrade.add(container);
    components.push(dUpgrade);
    dUpgrade.move(bs.upgrade.x,
                  bs.upgrade.y);
  };
  initContainer();

  this.init = data => {
    dBg.init({});
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
