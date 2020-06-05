import AContainer from './acontainer';

import CardStack from './cardstack';
import CardPlaceholder from './cardplaceholder';

import { hiddenStacks } from '../cards';

import { isN } from '../soliutils';

export default function SoliStacks(play, ctx, bs) {

  this.solitaire = play.solitaire;

  let dStacks = [
    new SoliStack(this, ctx, { n: 0, ...bs }),
    new SoliStack(this, ctx, { n: 1, ...bs }),
    new SoliStack(this, ctx, { n: 2, ...bs }),
    new SoliStack(this, ctx, { n: 3, ...bs }),
    new SoliStack(this, ctx, { n: 4, ...bs }),
    new SoliStack(this, ctx, { n: 5, ...bs }),
    new SoliStack(this, ctx, { n: 6, ...bs })
  ];

  this.dStackN = n => dStacks[n];

  let container = this.container = new AContainer();
  const initContainer = () => {
    dStacks.forEach((_, i) => {
      _.container.move(i * bs.stacks.width, 0);
      container.addChild(_);
    });
  };
  initContainer();

  const observePSelection = ({ 
    active,
    stackN,
    cards }) => {

      if (!isN(stackN)) {
        return;
      }

      let dStack = this.dStackN(stackN);

      if (active) {
        dStack.highlightCards(cards);
      } else {
        dStack.highlight(false);
      }
  };

  this.solitaire.pSelection.subscribe(observePSelection);

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
    },
    ...bs
  });

  let dBacks = new CardStack(this, ctx, bs);

  let dPlaceholder = new CardPlaceholder(this, ctx, {
    onEndCard: () => {
      play.solitaire.userActionEndSelectStack(n);
    },
    ...bs
  });

  let observeStack = play.solitaire.stackN(n);

  observeStack.subscribe(stack => {
    dFronts.init({ stack: stack.front });
    dBacks.init({ stack: hiddenStacks[stack.hidden.length] });
    extendCards(stack.hidden.length, stack.front.length);
  });

  const extendCards = (backs, fronts) => {
    let nbCards = backs + fronts;
    let extend = bs.stacks.height / (nbCards + 3);

    let extendBacks = extend * backs,
        extendFronts = extend * (fronts + 3);

    dBacks.extend(extendBacks);
    dFronts.extend(extendFronts);
  };

  this.highlight = dFronts.highlight;
  this.highlightCards = dFronts.highlightCards;
  this.nextCardGlobalPosition = dFronts.nextCardGlobalPosition;
  this.lastCardGlobalPosition = dBacks.lastCardGlobalPosition;

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dPlaceholder);
    container.addChild(dBacks);
    container.addChild(dFronts);
  };
  initContainer();

  this.init = (data) => {
    dPlaceholder.init();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  const renderFront = () => {
    let lb = dBacks.nextCardLocalPosition();
    dFronts.container.move(lb[0], lb[1]);
  };

  this.render = () => {
    renderFront();
    this.container.render();
  };
}
