import AContainer from './acontainer';

import CardStack from './cardstack';

export default function SoliStacks(play, ctx, bs) {

  this.solitaire = play.solitaire;

  let dStacks = [
    new SoliStack(this, ctx, { n: 0 }),
    new SoliStack(this, ctx, { n: 1 }),
    new SoliStack(this, ctx, { n: 2 }),
    new SoliStack(this, ctx, { n: 3 }),
    new SoliStack(this, ctx, { n: 4 }),
    new SoliStack(this, ctx, { n: 5 }),
    new SoliStack(this, ctx, { n: 6 })
  ];

  this.dStackN = n => dStacks[n];

  let container = this.container = new AContainer();
  const initContainer = () => {
    dStacks.forEach(_ => container.addChild(_));
  };
  initContainer();

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function SoliStack(play, ctx, bs) {

  let { n } = bs;

  let dFronts = new CardStack(this, ctx, {
    onBeginCard: (nCard, epos, decay) => {
      play.solitaire.userActionSelectStack(n, nCard, epos, decay);
    },
    onEndCard: (nCard) => {
      play.solitaire.userActionEndSelectStack(n);
    }
  });

  let dBacks = new CardStack(this, ctx, {});

  let observeStack = play.solitaire.stackN(n);

  observeStack.subscribe(stack => {
    dFronts.init({ stack: stack.front });
  });

  this.nextCardGlobalPosition = dFronts.nextCardGlobalPosition;
  this.lastCardGlobalPosition = dBacks.lastCardGlobalPosition;

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dFronts);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
