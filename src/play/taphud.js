import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import TapButton from './tapbutton';
import FText from './ftext';

export default function TapHud(play, ctx, bs) {

  const { textures } = ctx;

  const container = dContainer();

  let components = [];

  let dBg = new TapSprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: textures['mbg']
  });

  let dUpgrade = new TapButton(this, ctx, {
    width: bs.upgrade.width,
    height: bs.upgrade.height,
    textures: [textures['toggleOn'],
               textures['toggleOff']],
    icon: textures['iconUpgrade'],
    onClick: onUpgradeClick
  });

  let dTaps = new FText(this, ctx, {
    size: bs.taps.height,
    texture: textures['fletters'],
    kerning: textures['fkerning']
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

    dTaps.add(container);
    components.push(dTaps);
    dTaps.move(bs.taps.x,
               bs.taps.y);
  };
  initContainer();

  let tapper;

  this.init = data => {
    tapper = data.tapper;
    dBg.init({});

    dUpgrade.init({});
    
    dTaps.init({});
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };


  this.update = delta => {
    dTaps.setText("" + tapper.taps());

    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
