import iPol from '../ipol';
import { Easings } from '../ipol';

import { rect } from '../dquad/geometry';

import AContainer from './acontainer';
import ASprite from './asprite';

import VScrollList from './vscrolllist';
import OptionShowTutorial from './options/showtutorial';
import OptionSoliCardsPerDraw from './options/solicardsperdraw';

import { hitTest, moveHandler } from './util';

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

    let selectWidth = checkboxWidth * 0.5;
    let select = rect(0, 0, selectWidth,
                      selectWidth);

    return {
      uiMargin,
      checkbox,
      select,
      menuInside,
      menu,
      width,
      height
    };
  })();

  let dBg = new ASprite(this, ctx, {
    width: bs.menu.width,
    height: bs.menu.height,
    texture: mcards.front
  });
  
  let gameOptions = () => [
    new OptionShowTutorial(this, ctx, bs)
  ];

  let dOptionsContainer = new VScrollList(this, ctx, {
    width: bs.menuInside.width,
    height: bs.menuInside.height,
    contents: [
      ...gameOptions()
    ]
  });

  let dOptionsSolitaireContainer = new VScrollList(this, ctx, {
    width: bs.menuInside.width,
    height: bs.menuInside.height,
    contents: [
      new OptionSoliCardsPerDraw(this, ctx, bs),
      ...gameOptions()
    ]
  });

  let dOptionsSpiderContainer = new VScrollList(this, ctx, {
    width: bs.menuInside.width,
    height: bs.menuInside.height,
    contents: [
      ...gameOptions()
    ]
  });

  let dOptionsFreecellContainer = new VScrollList(this, ctx, {
    width: bs.menuInside.width,
    height: bs.menuInside.height,
    contents: [
      ...gameOptions()
    ]
  });

  const allOptionsContainers = [
    dOptionsContainer,
    dOptionsSpiderContainer,
    dOptionsSolitaireContainer,
    dOptionsFreecellContainer,
  ];

  let dOptionsGames = {
    'spider': dOptionsSpiderContainer,
    'freecell': dOptionsFreecellContainer,
    'solitaire': dOptionsSolitaireContainer
  };

  let dCurrentOptionsContainer;

  let container = this.container = new AContainer();
  const initContainer = () => {
    dBg.anchor(0.5);
    dBg.rotation(Math.PI * 0.5);
    dBg.move(bs.menu.x, bs.menu.y);
    container.addChild(dBg);

    allOptionsContainers.forEach(_ => 
        _.container
        .move(bs.menuInside.x,
              bs.menuInside.y)
    );
  };
  initContainer();

  const setOptionsContainer = dO => {
    if (dCurrentOptionsContainer) {
      container.removeChild(dCurrentOptionsContainer);
    }
    container.addChild(dO);
    dCurrentOptionsContainer = dO;
  };

  this.cardGame.oView.subscribe(view => {
    let { home, game } = view;

    if (home) {
      setOptionsContainer(dOptionsContainer);
    } else {
      setOptionsContainer(dOptionsGames[game]);
    }
  });

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
