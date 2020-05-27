import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CandyBackground from './candybackground';
import CandyCards from './candycards';
import SoliStack from './solistack';
import SoliDraw from './solidraw';
import DragStack from './dragstack';
import SoliReveal from './solireveal';
import SoliHole from './solihole';
import SoliHud from './solihud';
import SoliDeal from './solideal';

import SpiderBar from './spiderbar';


import Solitaire from '../solitaire';

import { backCard, queenHearts } from '../cards';

import { fxHandler2, moveHandler, hitTest } from './util';

export default function SolitaireView(play, ctx, pbs) {

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

  let solitaire = new Solitaire();

  let dBg = new CandyBackground(this, ctx, bs);

  let dDraw = new SoliDraw(this, ctx, bs);
  
  let dStacksContainer = dContainer();
  let dStacks = [
    new SoliStack(this, ctx, bs),
    new SoliStack(this, ctx, bs),
    new SoliStack(this, ctx, bs),
    new SoliStack(this, ctx, bs),
    new SoliStack(this, ctx, bs),
    new SoliStack(this, ctx, bs),
    new SoliStack(this, ctx, bs)
  ];

  let dHolesContainer = dContainer();
  let dHoles = [
    new SoliHole(this, ctx, bs),
    new SoliHole(this, ctx, bs),
    new SoliHole(this, ctx, bs),
    new SoliHole(this, ctx, bs)
    
  ];

  let dDragStack = new DragStack(this, ctx, bs);
  
  let dSoliReveal = new SoliReveal(this, ctx, bs);

  let dSoliDeal = new SoliDeal(this, ctx, bs);

  // let dSoliHud = new SoliHud(this, ctx, bs);
  let dSoliHud = new SpiderBar(this, ctx, {
    onUndo() {
      solitaire.undo();
    },
    onNewGame() {
      solitaire.newGame();
    },
    ...bs
  });

  this.soliStackN = n => dStacks[n];
  this.drawStack = dDraw.drawStack;
  this.soliHoleN = n => dHoles[n];
  this.dDraw = dDraw;

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dBg.add(container);
    components.push(dBg);

    dDraw.move(bs.draws.x, bs.draws.y);
    dDraw.add(container);
    components.push(dDraw);

    dHolesContainer.position.set(bs.holes.x, bs.holes.y);
    container.addChild(dHolesContainer);
    dHoles.forEach((dHole, i) => {
      dHole.move(0, i * bs.holes.height);
      dHole.add(dHolesContainer);
      components.push(dHole);
    });

    dStacksContainer.position.set(bs.stacks.x, bs.stacks.y);
    container.addChild(dStacksContainer);
    dStacks.forEach((dStack, i) => {
      dStack.move(i * bs.stacks.width, 0);
      dStack.add(dStacksContainer);
      components.push(dStack);
    });

    dSoliReveal.add(container);
    components.push(dSoliReveal);

    dDragStack.add(container);
    components.push(dDragStack);

    dSoliDeal.add(container);
    components.push(dSoliDeal);

    dSoliHud.move(bs.bar.x, bs.bar.y);
    dSoliHud.add(container);
    components.push(dSoliHud);
  };
  initContainer();

  this.init = data => {

    solitaire.init();

    dSoliHud.init({});

    dSoliReveal.init({ solitaire });
    dDragStack.init({ solitaire });
    dDraw.init({ solitaire });
    dSoliDeal.init({ solitaire });

    dStacks.forEach((dStack, i) => {
      dStack.init({
        solitaire,
        i
      });
    });

    dHoles.forEach((dHole, i) => {
      dHole.init({
        solitaire,
        i
      });
    });
  };

  const tapEnd = () => {
    solitaire.endTap();
  };

  const handleTap = moveHandler({
    onBegin(epos) {
    },
    onUpdate(epos) {
      solitaire.moveSelect(epos);
    },
    onEnd() {
      tapEnd();
    }
  }, events);

  this.update = delta => {
    solitaire.update(delta);
    handleTap(delta);
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

  this.visible = (visible) => {
    container.visible = visible;
  };

  this.move = (x, y) => container.position.set(x, y);
}
