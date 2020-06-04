import { dContainer } from '../asprite';

import CandyCard from './candycards';
import CandyDeck from './candydeck';
import CandyStack from './candystack';
import CandyCardPlace from './candycardplace';

import { fxHandler, fxHandler2 } from './util';

export default function Solistack(play, ctx, bs) {

  let solitaire;
  let stack;


  let dBacks = new CandyDeck(this, ctx, {
    extendLimit: true,
    deckHeight: bs.deck.height,
    ...bs
  });
  let dFronts = new CandyStack(this, ctx, {
    onBeginCard: (nCard, epos, decay) => {
      solitaire.select(stack.n, nCard, epos, decay);
    },
    onEndCard: (nCard) => {
      solitaire.endSelect(stack.n);
    },
    ...bs
  });

  let dCardPlace = new CandyCardPlace(this, ctx, {
    onEndCard: () => {
      solitaire.endSelect(stack.n);
    },
    ...bs
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dCardPlace.add(container);
    components.push(dCardPlace);
    
    dBacks.add(container);
    components.push(dBacks);

    dFronts.add(container);
    components.push(dFronts);

  };
  initContainer();

  this.init = data => {
    solitaire = data.solitaire;
    stack = solitaire.stack(data.i);

    refresh();
  };

  const refresh = this.refresh = () => {
    stack = solitaire.stack(stack.n);

    dCardPlace.init({});
    dFronts.init({ stack: stack.front });
    dBacks.init({ nbStack: stack.hidden.length });

    let nbBacks = stack.hidden.length,
        frontStack = stack.front;

    // extendCards(nbBacks, frontStack.length);
  };

  const extendCards = (backs, fronts) => {
    let nbCards = backs + fronts;
    let extend = bs.stacks.height / (nbCards + 3);

    let extendBacks = extend * backs,
        extendFronts = extend * fronts + 3;

    dBacks.extend(extendBacks);
    dFronts.extend(extendFronts);

  };

  this.globalPositionNextCard = dFronts.globalPositionNextCard;
  this.globalPositionLastCard = dBacks.globalPositionLastCard;

  const handleSelected = fxHandler2({
    onBegin(fxDataSelected) {
      let { stackN } = fxDataSelected.data;

      if (stackN === stack.n) {
        // dFronts.init({ stack: solitaire.stack(stackN).front });
        refresh();
      }
    },
    onUpdate() {
    },
    onEnd() {
    }
  }, () => solitaire.data.selected);

  const handleSettled = fxHandler2({
    onBegin() {
    },
    onUpdate() {
    },
    onEnd(fxDataSettle) {

      let { dstStackN } = fxDataSettle.data;

      if (dstStackN === stack.n) {
        // dFronts.init({ stack: solitaire.stack(dstStackN).front });
        refresh();
      }
    }
  }, () => solitaire.data.settle);

  const handleDeal = fxHandler2({
    onBegin() {
    },
    onUpdate() {
    },
    onEnd(fxDataEnd) {
      let { stackN } = fxDataEnd.data;

      if (stackN === stack.n) {
        refresh();
      }
    }
  }, () => solitaire.data.deal);

  this.update = delta => {
    handleSelected(delta);
    handleSettled(delta);
    handleDeal(delta);
    components.forEach(_ => _.update(delta));
  };

  const renderFront = () => {
    let lb = dBacks.nextBounds();
    dFronts.move(lb[0], lb[1]);
  };

  this.render = () => {
    components.forEach(_ => _.render());
    renderFront();
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.bounds = () => container.getBounds();

  this.globalPosition = () => container.getGlobalPosition();

  this.move = (x, y) => container.position.set(x, y);
}
