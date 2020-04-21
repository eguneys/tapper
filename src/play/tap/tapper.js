import { dContainer } from '../asprite';
import TapHud from './taphud';
import TapUpgrade from './tapupgrade';
import TapFx from './tapfx';
import TapGame from './tapgame';

export default function Play(play, ctx, bs) {

  const { textures } = ctx;

  let container = dContainer();

  let dFx = new TapFx(this, ctx, bs);

  let dHud = new TapHud(this, ctx, bs);

  let dUpgradeMenu = new TapUpgrade(this, ctx, bs);

  let dGame = new TapGame(this, ctx, bs);

  let components = [];

  const initContainer = () => {
    dHud.add(container);
    components.push(dHud);

    dGame.add(container);
    components.push(dGame);

    dFx.add(container);
    components.push(dFx);

    dUpgradeMenu.add(container);
    components.push(dUpgradeMenu);
  };
  initContainer();

  let tapper;
  this.init = data => {
    tapper = data.tapper;

    dFx.init({tapper});
    dHud.init({tapper});
    dUpgradeMenu.init({tapper});
    dGame.init({tapper});
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
