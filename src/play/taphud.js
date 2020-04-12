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

  let dTest = new FText(this, ctx, {
    size: bs.width * 0.08,
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

    dTest.add(container);
    components.push(dTest);
    dTest.move(bs.width * 0.00,
               bs.height * 0.0);
  };
  initContainer();

  this.init = data => {
    dBg.init({});

    dUpgrade.init({});
    
    dTest.init({});
    // dTest.setText('ABCD\nEFGH\nIJKL\nMNOP\nQRST\nUVW\nXYZ');
    // dTest.setText('EFGH\nIJKL\nMNOP\nQRST\nUVW\nXYZ');
    //dTest.setText('0123\n4567\n890');
    // dTest.setText('?.+\n-/,');
    dTest.setText('THE \nBROWN\nFOX\nJUMPS\nOVER, THE\nLAZY\nDOG.\n+1,000M');
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
