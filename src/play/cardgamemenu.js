import iPol from '../ipol';
import { Easings } from '../ipol';

import { rect } from '../dquad/geometry';

import AContainer from './acontainer';
import ASprite from './asprite';

import VScrollList from './vscrolllist';
import OptionShowTutorial from './options/showtutorial';

export default function CardGameMenu(play, ctx, pbs) {

  this.cardGame = play.cardGame;

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let bs = (() => {
    let { width, height } = pbs;

    let uiMargin = height * 0.05;

    let cRatio = 64 / 89;

    let mHeight = (height - uiMargin * 2.0) * 1.4,
        mWidth = mHeight * cRatio;

    let menu = rect(width * 0.5,
                    height * 0.5,
                    mWidth,
                    mHeight);

    let innerMargin = mWidth * 0.1;

    let menuInside = rect(width * 0.5 -
                          mHeight * 0.5 +
                          innerMargin,
                         height * 0.5 -
                          mWidth * 0.5 +
                          innerMargin,
                         mHeight - 
                          innerMargin * 2.0,
                         mWidth -
                          innerMargin * 2.0);

    let checkboxWidth = mWidth * 0.25;
    let checkbox = rect(0,
                        0,
                        checkboxWidth,
                        checkboxWidth * 0.5);

    return {
      uiMargin,
      checkbox,
      menuInside,
      menu,
      width,
      height
    };
  })();

  let iOffsetY = new iPol(1, 1, {});

  let dBg = new ASprite(this, ctx, {
    width: bs.menu.width,
    height: bs.menu.height,
    texture: mcards.front
  });

  let dOptionsContainer = new VScrollList(this, ctx, {
    width: bs.menuInside.width,
    height: bs.menuInside.height,
    contents: [
      new OptionShowTutorial(this, ctx, bs),
      new OptionShowTutorial(this, ctx, bs),
      new OptionShowTutorial(this, ctx, bs),
      new OptionShowTutorial(this, ctx, bs),
      new OptionShowTutorial(this, ctx, bs),
      new OptionShowTutorial(this, ctx, bs),
      new OptionShowTutorial(this, ctx, bs),

    ]
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    dBg.anchor(0.5);
    dBg.rotation(Math.PI * 0.5);
    dBg.move(bs.menu.x, bs.menu.y);
    container.addChild(dBg);

    dOptionsContainer
      .container
      .move(bs.menuInside.x,
            bs.menuInside.y);
    container.addChild(dOptionsContainer);
  };
  initContainer();

  this.cardGame.oHamburger.subscribe(({ open }) => {
    smoothopen(open);
  });

  const smoothopen = (show) => {
    iOffsetY.value(iOffsetY.value());
    iOffsetY.target(show?0:1);
  };

  this.init = (data) => {};

  this.update = delta => {
    iOffsetY.update(delta / 200);

    this.container.update(delta);
  };

  let topOffsetY = -bs.height;

  this.render = () => {

    let vOffsetY = iOffsetY.easing(Easings.easeInOutQuad);

    let offsetY = vOffsetY * topOffsetY;
    
    this.container.moveY(offsetY);

    if (vOffsetY === 1) {
      this.container.visible(false);
    } else {
      this.container.visible(true);
    }

    this.container.render();
  };
}
