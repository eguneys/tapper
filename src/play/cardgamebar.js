import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import TapSprite from './tapsprite';

export default function CardGameBar(play, ctx, pbs) {

  const { textures } = ctx;

  const mhud = textures['mhud'];

  let bs = (() => {

    let { width, height } = pbs;

    let iconWidth = height * 0.08;

    let icon = rect(0, 0, 
                    iconWidth,
                    iconWidth);

    let borderMargin = iconWidth * 0.5;

    let menu = rect(width - icon.width - borderMargin,
                    borderMargin,
                    iconWidth,
                    iconWidth);

    let back = rect(width - icon.width - borderMargin,
                    menu.y1 + borderMargin * 0.5,
                    iconWidth,
                    iconWidth);

    return {
      icon,
      menu,
      back,
      width,
      height
    };

  })();

  let dMenu = new TapSprite(this, ctx, {
    width: bs.icon.width,
    height: bs.icon.height,
    texture: mhud['menu']
  });

  let dBack = new TapSprite(this, ctx, {
    width: bs.icon.width,
    height: bs.icon.height,
    texture: mhud['back']
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dMenu.move(bs.menu.x, bs.menu.y);
    dMenu.add(container);
    components.push(dMenu);

    dBack.move(bs.back.x, bs.back.y);
    dBack.add(container);
    components.push(dBack);

  };
  initContainer();

  this.init = data => {
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
