import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import TapSprite from './tapsprite';
import FText from './ftext';

import { tapHandler } from './util';

export default function CardGameBar(play, ctx, pbs) {

  const { events, textures } = ctx;

  const mhud = textures['mhud'];

  let bs = (() => {

    let { width, height } = pbs;

    let iconWidth = height * 0.08;

    let icon = rect(0, 0, 
                    iconWidth,
                    iconWidth);

    let borderMargin = iconWidth * 0.5;

    let barX = width - icon.width - borderMargin;

    let menu = rect(barX,
                    borderMargin,
                    iconWidth,
                    iconWidth);

    let back = rect(barX,
                    menu.y1 + borderMargin * 0.5,
                    iconWidth,
                    iconWidth);

    let gametext = rect(barX - borderMargin * 1.2,
                        back.y1 + borderMargin,
                        iconWidth * 0.4,
                        iconWidth);
                        

    return {
      icon,
      menu,
      back,
      gametext,
      width,
      height
    };

  })();

  let dMenu = new TapSprite(this, ctx, {
    width: bs.icon.width,
    height: bs.icon.height,
    texture: mhud['menu']
  });

  let dInGameContainer = dContainer();
  let dBack = new TapSprite(this, ctx, {
    width: bs.icon.width,
    height: bs.icon.height,
    texture: mhud['back']
  });

  let dGameText = new FText(this, ctx, {
    size: bs.gametext.width
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dMenu.move(bs.menu.x, bs.menu.y);
    dMenu.add(container);
    components.push(dMenu);

    container.addChild(dInGameContainer);
    dBack.move(bs.back.x, bs.back.y);
    dBack.add(dInGameContainer);
    components.push(dBack);

    dGameText.move(bs.gametext.x, bs.gametext.y);
    dGameText.add(dInGameContainer);
    components.push(dGameText);

  };
  initContainer();

  this.init = data => {
  };

  this.setGame = game => {
    if (game) {
      dInGameContainer.visible = true;
      dGameText.setText(game);
    } else {
      dInGameContainer.visible = false;
    }
  };

  const onMenuTap = () => {
    console.log('menu');
  };

  const onBackTap = () => {
    console.log('back');
  };

  const handleMenuTap = tapHandler(onMenuTap, events, () => dMenu.bounds());

  const handleBackTap = tapHandler(onBackTap, events, () => dBack.bounds());

  this.update = delta => {
    handleMenuTap(delta);
    handleBackTap(delta);
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
