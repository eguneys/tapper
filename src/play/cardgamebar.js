import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';
import AContainer from './acontainer';
import ASprite from './asprite';
import AText from './atext';

import { tapHandler } from './util';

export default function CardGameBar(play, ctx, pbs) {

  let cardGame = play.cardGame;

  const { events, textures } = ctx;

  const mhud = textures['mhud'];

  let { onMenuTap, onBackTap } = pbs;

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

  let dMenu = new ASprite(this, ctx, {
    width: bs.icon.width,
    height: bs.icon.height,
    texture: mhud['menu']
  });

  let dInGameContainer = dContainer();
  let dBack = new ASprite(this, ctx, {
    width: bs.icon.width,
    height: bs.icon.height,
    texture: mhud['back']
  });

  let dGameText = new AText(this, ctx, {
    size: bs.gametext.width
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    dMenu.container.move(bs.menu.x, bs.menu.y);
    container.addChild(dMenu);

    container.c.addChild(dInGameContainer);

    dBack.container.move(bs.back.x, bs.back.y);
    dInGameContainer.addChild(dBack.container.c);

    dGameText.container.move(bs.gametext.x, bs.gametext.y);
    dInGameContainer.addChild(dGameText.container.c);    
  };
  initContainer();

  let gameNames = {
    'spider': 'SPIDER',
    'solitaire': 'SOLI\nTAIRE',
    'freecell': 'FREE\nCELL'
  };

  cardGame.view.subscribe(view => {
    if (view.game) {
      dInGameContainer.visible = true;
      dGameText.setText(gameNames[view.game]);
    } else {
      dInGameContainer.visible = false;
    }
  });

  this.init = (data) => {};

  const handleMenuTap = tapHandler(onMenuTap, events,
                                   () => dMenu.container.bounds());

  const handleBackTap = tapHandler(onBackTap, events,
                                   () => dBack.container.bounds());

  this.update = delta => {
    handleMenuTap(delta);
    handleBackTap(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
