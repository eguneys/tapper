import { dContainer } from '../asprite';
import TapHud from './taphud';
import TapUpgrade from './tapupgrade';

export default function Play(play, ctx, bs) {

  const { textures } = ctx;

  let container = dContainer();

  let dHud = new TapHud(this, ctx, bs);

  let dUpgradeMenu = new TapUpgrade(this, ctx, bs);

  let components = [];

  const initContainer = () => {
    dHud.add(container);
    components.push(dHud);

    dUpgradeMenu.add(container);
    components.push(dUpgradeMenu);
  };
  initContainer();

  let tapper;
  this.init = data => {
    tapper = data.tapper;

    dHud.init({tapper});
    dUpgradeMenu.init({tapper});

    dUpgradeMenu.toggle();
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };


  this.toggleUpgradeMenu = () => {
    dUpgradeMenu.toggle();
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
