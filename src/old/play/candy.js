import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import { cols } from '../candyutil';

import Candy from '../candy';

import CandyResources from './candyresources';
import CandyBackground from './candybackground';
import CandyGame from './candygame';
import CandyFx from './candyfx';

export default function CandyView(play, ctx, pbs) {

  let bs = (() => {
    let { width, height } = pbs;

    let margin = width * 0.01;

    let resourceH = height * 0.025,
        resourceW = resourceH * 6;

    let resource = rect(margin, margin,
                        resourceW,
                        resourceH);

    let gameW = (width - margin * 2);
    let gameX = (width - gameW) * 0.5,
        gameY = (resourceH + margin) * 3 + margin * 3;
    let game = rect(gameX, gameY,
                    gameW,gameW);
                    
    let tileW = Math.floor(gameW / cols);

    let bgMargin = margin;
    let fgMargin = bgMargin * 2.0;
    let bgW = tileW - bgMargin;
    let fgW = tileW - fgMargin;
    let tile = {
      tileW,
      bgMargin,
      fgMargin,
      bgW,
      fgW
    };

    return {
      margin,
      game,
      resource,
      tile,
      width,
      height
    };
  })();

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
    dResources.init({candy});
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
