import AContainer from './acontainer';

import CardStack from './cardstack';
import CardPlaceholder from './cardplaceholder';
import { hiddenStacks } from '../cards';

export default function SpiStack(play, ctx, bs) {

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
    initStack(data);
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
}
