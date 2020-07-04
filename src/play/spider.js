import { rect } from '../dquad/geometry';
import AContainer from './acontainer';

import GSpider from '../gspider';

import CardBackground from './cardbackground';
import SpiderSideBar from './spidersidebar';
import SpiderSoul from './spidersoul';
import SpiderStacks from './spiderstacks';
import SpiderDeal from './spideal';
import SpiderDraw from './spiderdraw';
import SpiderDrag from './spiderdrag';
import SpiderReveal from './spiderreveal';
import SpiderMove from './spidermove';

export default function Spider(play,
                               ctx,
                               pbs) {

  const { events } = ctx;

  let bs = (() => {
    let { width, 
          height,
          text,
          bar } = pbs;

    let gameWidth = width - bar.width;

    let uiMargin = gameWidth * 0.008;
    let stackMargin = gameWidth * 0.002;

    let cRatio = 64 / 89,
        tWidth = (gameWidth - uiMargin * 2.0) / 11;

    let cWidth = tWidth - stackMargin,
        cHeight = cWidth / cRatio;
    cHeight = Math.floor(cHeight);
    cWidth = Math.floor(cWidth);
    let card = rect(0, 0, cWidth, cHeight);

    let draws = rect(uiMargin, 
                     height -
                     card.height -
                     uiMargin, 
                     tWidth,
                     0);

    let stacks = rect(draws.x1 + stackMargin,
                      uiMargin,
                      tWidth,
                      height - uiMargin * 2.0);


    return {
      uiMargin,
      text,
      bar,
      width,
      height,
      card,
      stacks,
      draws
    };
    
  })();

  let cardGame = this.cardGame = play.cardGame;
  let gspider = this.gspider = new GSpider(cardGame);

  let dSidebar = new SpiderSideBar(this, ctx, bs);

  let dSoul = new SpiderSoul(this, ctx, bs);

  let dBg = new CardBackground(this, ctx, bs);

  let dStacks = new SpiderStacks(this, ctx, bs);

  let dSpiderDeal = new SpiderDeal(this, ctx, bs);

  let dDraw = new SpiderDraw(this, ctx, bs);

  let dSpiderDrag = new SpiderDrag(this, ctx, bs);
  let dSpiderReveal = new SpiderReveal(this, ctx, bs);
  let dSpiderMove = new SpiderMove(this, ctx, bs);

  this.dStackN = dStacks.dStackN;
  this.dDraw = dDraw;

  this.getHitKeyForEpos = epos => {
    let res = [dStacks]
        .reduce((acc, hitTarget) =>
          acc ? acc : 
            hitTarget
            .getHitKeyForEpos(epos),
          null);

    return res;
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dSoul);

    container.addChild(dBg);

    container.addChild(dDraw);
    dDraw.container.move(bs.draws.x, 
                         bs.draws.y);

    container.addChild(dStacks);
    dStacks.container
      .move(bs.stacks.x,
            bs.stacks.y);

    container.addChild(dSpiderDeal);
    container.addChild(dSpiderReveal);
    container.addChild(dSpiderMove);

    container.addChild(dSidebar);

    container.addChild(dSpiderDrag);
  };
  initContainer();

  let { fixtures, 
        playStore,
        optionsStore } = ctx;

  let once = true;

  this.init = (data) => {
    let play = playStore.play('spider');

    if (once) {
      once = false;
      play = fixtures.spiderEnding;
    }

    gspider.userInit({
      play,
      options: optionsStore.spider()
    });
  };

  gspider.oSaveState.subscribe(state => {
    playStore.play('spider', state);
  });

  this.remove = () => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
