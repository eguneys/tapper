import { rect } from '../dquad/geometry';
import { dContainer } from '../asprite';

import CandyBackground from './candybackground';
import CandyDeck from './candydeck';

import SpiderStack from './spiderstack';
import SpiderHoles from './spiderholes';
import SpiderBar from './spiderbar';

export default function Spider(play, ctx, pbs) {

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

    let stackMargin = Math.round(height * 0.1 / 16);

    let boundsMargin = stackMargin * 4.0;

    let deck = rect(0, 0, cWidth, cHeight * 0.2);

    let holes = rect(boundsMargin, boundsMargin + cHeight * 0.3, cWidth, cHeight);

    let draws = rect(boundsMargin, height - boundsMargin - cHeight - deck.height, cWidth, cHeight);

    let stacks = rect(draws.x + draws.width + stackMargin,
                      boundsMargin,
                      (cWidth + stackMargin),
                      height - stackMargin);

    let barWidth = cWidth * 1.1;

    let barHeight = cHeight * 2.0;

    let bar = rect(width - barWidth, barHeight,
                   barWidth,
                   height - barHeight - boundsMargin * 2.0);

    return {
      bar,
      stackMargin,
      draws,
      holes,
      deck,
      card,
      stacks,
      width,
      height
    };
  })();

  let dBg = new CandyBackground(this, ctx, bs);

  let dDrawDeck = new CandyDeck(this, ctx, {
    deckHeight: bs.deck.height,
    ...bs
  });

  let dStacksContainer = dContainer();
  let dStacks = [
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs),
    new SpiderStack(this, ctx, bs)
  ];

  let dHoles = new SpiderHoles(this, ctx, bs);

  let dBar = new SpiderBar(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dBg.add(container);
    components.push(dBg);

    dBar.move(bs.bar.x, bs.bar.y);
    dBar.add(container);
    components.push(dBar);

    dHoles.move(bs.holes.x, bs.holes.y);
    dHoles.add(container);
    components.push(dHoles);

    dDrawDeck.move(bs.draws.x, bs.draws.y);
    dDrawDeck.add(container);
    components.push(dDrawDeck);

    dStacksContainer.position.set(bs.stacks.x, bs.stacks.y);
    container.addChild(dStacksContainer);
    dStacks.forEach((dStack, i) => {
      dStack.move(i * bs.stacks.width, 0);
      dStack.add(dStacksContainer);
      components.push(dStack);
    });
  };
  initContainer();

  this.init = data => {

    dBar.init({});

    dStacks.forEach((dStack, i) => {
      dStack.init({
        i
      });
    });


    dHoles.init({});

    refreshDraw();
  };

  const refreshDraw = () => {
    let nbDeck = 3;

    dDrawDeck.init({ nbStack: nbDeck });
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
