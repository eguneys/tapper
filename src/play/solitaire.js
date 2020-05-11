import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CandyBackground from './candybackground';
import CandyCards from './candycards';
import SoliStack from './solistack';
import SoliDraw from './solidraw';
import DragStack from './dragstack';
import SoliReveal from './solireveal';

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
    let card = rect(0, 0, cWidth, cHeight);

    let stackMargin = 8;

    let draws = rect(stackMargin, stackMargin,
                     cWidth, cHeight);

    let stacks = rect(draws.x1 + stackMargin * 2.0,
                      stackMargin,
                      (cWidth + stackMargin),
                      height - stackMargin);

    let deck = rect(0, 0, cWidth, cHeight * 0.2);
    
    return {
      deck,
      cMargin,
      card,
      stacks,
      draws,
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


  let dDragStack = new DragStack(this, ctx, bs);
  
  let dSoliReveal = new SoliReveal(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dBg.add(container);
    components.push(dBg);

    dDraw.move(bs.draws.x, bs.draws.y);
    dDraw.add(container);
    components.push(dDraw);

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
  };
  initContainer();

  this.init = data => {

    solitaire.init();

    dSoliReveal.init({ solitaire });
    dDragStack.init({ solitaire });
    dDraw.init({ solitaire });

    dStacks.forEach((dStack, i) => {
      dStack.init({
        solitaire,
        i
      });
    });
  };

  this.soliStackN = n => dStacks[n];
  this.drawStack = dDraw.drawStack;

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

  this.move = (x, y) => container.position.set(x, y);
}
