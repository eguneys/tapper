import { rect } from '../dquad/geometry';
import { dContainer, sprite } from '../asprite';
import TapperView from './tapper';

import Tapper from '../tapper';

export default function Play(ctx) {

  const { textures, canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    let margin = 10;

    let buttonHeight = 60,
        buttonWidth = buttonHeight * 2;

    let taps = rect(margin, margin, 20, 20);

    let upgrade = rect(margin, 
                       height - margin - buttonHeight,
                       buttonWidth,
                       buttonHeight);

    let tap = rect(taps.x,
                   40,
                   width,
                   height - taps.height * 4.0 - upgrade.height);


    let menuWidth = width * 0.9,
        menuHeight = height * 0.8;
    
    let menuCloseWidth = width * 0.16;

    let menu = rect((width - menuWidth) * 0.5,
                    (height - menuHeight) * 0.5,
                    menuWidth,
                    menuHeight);

    let menuClose = rect(menu.x1 - menuCloseWidth,
                         menu.y - menuCloseWidth,
                         menuCloseWidth,
                         menuCloseWidth);

    let menuUpgrade = rect(0, 0, width, buttonHeight * 1.5);

    let hero = rect(0, 0, 64, 64);

    return {
      hero,
      menuClose,
      menuUpgrade,
      menu,
      tap,
      taps,
      upgrade,
      width,
      height
    };
  })();

  let container = dContainer();
  let dTapper = new TapperView(this, ctx, bs);
  let components = [];

  const initContainer = () => {
    dTapper.add(container);
    components.push(dTapper);
  };
  initContainer();

  let tapper = new Tapper();

  this.init = data => {
    tapper.init({});

    dTapper.init({tapper});
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    tapper.update(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
