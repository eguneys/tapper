import { makeOneDeck } from './deck';

import Fx from './fxs';

import SpiderDealsFx from './spiderdealsfx';
import SpiderDrawDeck from './spiderdrawdeck';

export default function Spider() {

  let data = this.data = {
    drawStack: new SpiderDrawDeck(),
    stacks: [
      new SpiderStack(0),
      new SpiderStack(1),
      new SpiderStack(2),
      new SpiderStack(3),
      new SpiderStack(4),
      new SpiderStack(5),
      new SpiderStack(6),
      new SpiderStack(7),
      new SpiderStack(8),
      new SpiderStack(9)
    ]
  };

  let dealsFxer = new SpiderDealsFx(this);

  const onDealEnd = (fxDataEnd) => {
    console.log(fxDataEnd.data);
    fxDataEnd.doEnd();
  };

  let fxDeal = new Fx(data, 'deal', onDealEnd);

  this.stack = n => data.stacks[n];
  this.drawStack = data.drawStack;

  let deck1 = makeOneDeck(),
      deck2 = makeOneDeck();

  this.newGame = () => {
    this.init();
  };

  this.init = () => {
    reset();
    beginDeal();
  };

  const reset = () => {
    data.stacks.forEach(_ => _.clear());
  };

  const beginDeal = () => {
    deck1.shuffle();
    deck2.shuffle();

    data.drawStack.init([...deck1.drawRest(),
                         ...deck2.drawRest()]);

    dealsFxer.init();
  };

  let allFxs = [fxDeal];

  const busyFxs = () => {
    return allFxs.some(_ => _.value());
  };

  const updateFxs = (delta) => {
    allFxs.forEach(_ => _.update(delta));
  };


  const updateDeals = delta => {
    if (fxDeal.value()) {
      return;
    }

    let fxData = dealsFxer.acquireDeal();
    if (fxData) {
      fxDeal.begin(fxData);
    }
  };

  this.update = (delta) => {
    updateDeals(delta);
    updateFxs(delta);
  };
}


function SpiderStack(n, hidden = [], front = []) {
  
  this.n = n;
  this.front = front;
  this.hidden = hidden;

  this.cut1 = n => front.splice(n, front.length - n);

  this.hide1 = cards => {
    cards.forEach(_ => hidden.push(_));
  };

  this.add1 = cards => {
    cards.forEach(_ => front.push(_));
  };

  this.clear = () => {
    front = this.front = [];
    hidden = this.hidden = [];
  };

  this.reveal1 = () => {
    return hidden.pop();
  };

  const top = () => front[front.length - 1];

  this.canReveal = () => front.length === 0 && hidden.length > 0;
}
