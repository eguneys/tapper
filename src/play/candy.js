import { dContainer } from '../asprite';

import Candy from '../candy';

import CandyResources from './candyresources';
import CandyBackground from './candybackground';
import CandyGame from './candygame';
import CandyFx from './candyfx';

export default function CandyView(play, ctx, bs) {

  let candy = new Candy();

  let dGame = new CandyGame(this, ctx, bs);
  let dBackground = new CandyBackground(this, ctx, bs);
  let dResources = new CandyResources(this, ctx, bs);
  let dFx = new CandyFx(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBackground.add(container);
    components.push(dBackground);

    dResources.add(container);
    components.push(dResources);
    dResources.move(bs.resource.x, bs.resource.y);

    dGame.add(container);
    components.push(dGame);
    dGame.move(bs.game.x, bs.game.y);

    dFx.add(container);
    components.push(dFx);
  };
  initContainer();

  this.init = data => {
    candy.init();

    dBackground.init({});
    dResources.init({});
    dGame.init({candy});
    dFx.init({candy});
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    candy.update(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
