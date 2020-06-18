import AContainer from './acontainer';

import CardStack from './cardstack';
import CardPlaceholder from './cardplaceholder';

import { hiddenStacks } from '../cards';

import { isN } from '../soliutils';

export default function SoliStacks(play, ctx, bs) {

  this.rsolitaire = play.rsolitaire;
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

  // const observePSelection = ({ 
  //   active,
  //   stackN,
  //   cards }) => {

  //     if (!isN(stackN)) {
  //       return;
  //     }

  //     let dStack = this.dStackN(stackN);

  //     if (active) {
  //       dStack.highlightCards(cards);
  //     } else {
  //       dStack.highlight(false);
  //     }
  // };

  // this.solitaire.pSelection.subscribe(observePSelection);

  this.init = (data) => {
    dStacks.forEach(_ => _.init());
    listenSolitaire();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  const listenSolitaire = () => {
    
  };


  const { revents } = ctx;

  this.drags = dStacks.map(_ => _.drags)
    .reduce((acc, _) => acc.merge(_));
  this.drops = dStacks.map(_ => _.drops)
    .reduce((acc, _) => acc.merge(_));
  this.clicks = dStacks.map(_ => _.clicks)
    .reduce((acc, _) => acc.merge(_));

}

function SoliStack(play, ctx, bs) {

  let { n } = bs;

  let dFronts = new CardStack(this, ctx, bs);
  let dBacks = new CardStack(this, ctx, bs);

  let dPlaceholder = new CardPlaceholder(this, ctx, bs);

  const extendCards = (backs, fronts) => {
    let nbCards = backs + fronts;
    let extend = bs.stacks.height / (nbCards + 3);

    let extendBacks = extend * backs,
        extendFronts = extend * (fronts + 3);

    dBacks.extend(extendBacks);
    dFronts.extend(extendFronts);

    // still a bug when there is one hidden card on the stack
    // calculate dFronts next card position for undo move
    // dBacks.render();
    // dFronts.render();
    // this.render();
  };

  this.nextCardGlobalPosition = dFronts.nextCardGlobalPosition;
  this.lastCardGlobalPosition = dBacks.lastCardGlobalPosition;

  let hilt = dFronts.highlight;
  let hiltCards = dFronts.highlightCards;

  let highlight;

  const updateHighlight = () => {
    if (highlight) {
      hiltCards(highlight);
    } else {
      hilt(false);
    }    
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dPlaceholder);
    container.addChild(dBacks);
    container.addChild(dFronts);
  };
  initContainer();

  this.init = (data) => {
    dPlaceholder.init();

    listenSolitaire();
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

  const insertN = _ => ({ ..._, stackN: n });

  let esPlaceholderDrops = dPlaceholder.drops
      .filter(_ => dFronts.empty() && dBacks.empty());

  this.clicks = dFronts.clicks.map(insertN);
  this.drags = dFronts.drags.map(insertN);
  this.drops = dFronts.drops
    .merge(esPlaceholderDrops)
    .map(insertN);

  function listenSolitaire() {

    play.rsolitaire().pStackHighlightN(n).onValue(_highlight => {
      highlight = _highlight;
      updateHighlight();
    });

    play.rsolitaire().pStackN(n).onValue(stack => {
      let inProgress = stack.inProgress();
      dFronts.init({ stack: stack.front, inProgress });
      dBacks.init({ stack: hiddenStacks[stack.hidden.length], inProgress });
      if (!inProgress) {
        extendCards(stack.hidden.length, stack.front.length);
      }
      updateHighlight();
    });
  }
}
