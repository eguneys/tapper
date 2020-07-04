import AContainer from './acontainer';
import { isN, stackPlate } from '../spiderutils';

import SpiStack from './spistack';

export default function SpiderStacks(play, ctx, bs) {

  let gspider = play.gspider;

  let dStacks = stackPlate.map(n =>
    new SpiStack(this, ctx, { n, ...bs }));

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

  this.init = (data) => {
    
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

  const observeFailSelection = ({
    active,
    stackN,
    cardN
  }) => {
    if (!isN(stackN)) {
      return;
    }

    let dStack = this.dStackN(stackN);

    if (active) {
      dStack.blackoutCards(cardN);
    } else {
      dStack.blackout(false);
    }
  };

  const observeEmptyStacks = (stacks) => {
    stacks
      .map(_ => this.dStackN(_))
      .forEach(_ => _.highlightEffect());

  };

  gspider.oPSelection.subscribe(observePSelection);

  gspider.oFailSelection.subscribe(observeFailSelection);

  gspider.oEmptyStacks.subscribe(observeEmptyStacks);

  stackPlate.forEach(n => {
    let dStack = this.dStackN(n);
    play.gspider.stackN(n).subscribe(dStack.init);
  });

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
