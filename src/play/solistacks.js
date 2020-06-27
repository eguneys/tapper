import AContainer from './acontainer';

import CardStack from './cardstack';
import CardPlaceholder from './cardplaceholder';

import { hiddenStacks } from '../cards';

import { isN } from '../soliutils';

export default function SoliStacks(play, ctx, bs) {

  this.gsolitaire = play.gsolitaire;
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

  this.getHitKeyForEpos = epos => {
    return dStacks.reduce((acc, dStack) =>
      acc ? acc : dStack.getHitCardForEpos(epos)
      , null);
  };

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

  this.gsolitaire.pSelection.subscribe(observePSelection);

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

  let dFronts = new CardStack(this, ctx, bs);

  let dBacks = new CardStack(this, ctx, bs);

  let dPlaceholder = new CardPlaceholder(this, ctx, bs);

  this.getHitCardForEpos = epos => {
    let res = [dFronts, dPlaceholder].
        reduce((acc, _) => 
          acc ? acc : _.getHitCardForEpos(epos)
          , null);

    if (res) {
      res.stackN = n;
    }
    return res;
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

  const extendCards = (backs, fronts) => {
    let nbCards = backs + fronts;
    let extend = bs.stacks.height / (nbCards + 3);

    let extendBacks = extend * backs,
        extendFronts = extend * (fronts + 3);

    dBacks.extend(extendBacks);
    dFronts.extend(extendFronts);

    // still a bug when there is one hidden card on the stack
    // calculate dFronts next card position for undo move
    dBacks.render();
    dFronts.render();
    this.render();
  };

  const initStack = stack => {
    let inProgress = stack.inProgress();

    dFronts.init({ stack: stack.front, inProgress });
    dBacks.init({ stack: hiddenStacks[stack.hidden.length], inProgress });
    if (!inProgress) {
      extendCards(stack.hidden.length, stack.front.length);
    }
  };

  play.gsolitaire.stackN(n).subscribe(initStack);

  // play.solitaire.stackN(n).subscribe(initStack);
}
