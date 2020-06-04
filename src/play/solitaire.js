import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import AContainer from './acontainer';

import Solitaire from '../solitaire';
import SoliStacks from './solistacks';
import SoliDraw from './solidraw';
import SoliDeal from './solideal';

import { moveHandler2 } from './util';

export default function Play(play, ctx, pbs) {

  const { events } = ctx;

  let bs = (() => {
    let { width, height } = pbs;

    let cRatio = 64 / 89;
    let cMargin = 10,
        cHeight = height / 4 - cMargin,
        cWidth = cRatio * cHeight;
    cHeight = Math.round(cHeight);
    cWidth = Math.round(cWidth);
    let card = rect(0, 0, cWidth, cHeight);

    let stackMargin = Math.round(height * 0.1 / 4);

    let draws = rect(stackMargin, stackMargin,
                     cWidth, cHeight);

    let stacks = rect(draws.x1 + stackMargin * 3.0,
                      stackMargin,
                      (cWidth + stackMargin),
                      height - stackMargin);

    let holes = rect(stacks.x + stacks.width * 7 + stackMargin * 2.0,
                     stacks.y,
                     0, (cHeight + stackMargin));

    let deck = rect(0, 0, cWidth, cHeight * 0.2);

    let boundsMargin = stackMargin;

    let barWidth = cWidth * 1.1;

    let barHeight = cHeight * 2.0;

    let bar = rect(width - barWidth, barHeight,
                   barWidth,
                   height - barHeight - boundsMargin * 2.0);
    
    return {
      deck,
      stackMargin,
      cMargin,
      card,
      stacks,
      holes,
      draws,
      bar,
      width,
      height
    };
  })();

  let solitaire = this.solitaire = new Solitaire();

  let dDraw = new SoliDraw(this, ctx, bs);

  let dStacks = new SoliStacks(this, ctx, bs);

  let dSoliDeal = new SoliDeal(this, ctx, bs);

  this.dStackN = dStacks.dStackN;
  this.dStackDraw = dDraw.dStackDraw;
  this.dDraw = dDraw;

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dDraw);
    dDraw.container.move(bs.draws.x, bs.draws.y);

    container.addChild(dStacks);
    container.addChild(dSoliDeal);

  };
  initContainer();

  this.init = (data) => {
    solitaire.init();
    dDraw.init();
  };

  const handleTap = moveHandler2({
    onMove(epos) {
      solitaire.userActionMove(epos);
    },
    onEnd() {
      solitaire.userActionEndTap();
    }
  }, events);

  this.update = delta => {
    handleTap();
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
