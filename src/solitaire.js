import { makeOneDeck } from './deck';
import Fx from './fxs';

export default function Solitaire() {

  let data = this.data = {
  };

  const onSettleEnd = ({
    selected
  }) => {

    let {
      draw,
      stackN,
      cardN,
      stack,
      dstStackN
    } = selected;

    

    if (draw) {
      console.log(stack);
    } else {
      endSelect(stackN, dstStackN, stack);
    }
  };

  let fxSettle = new Fx(data, 'settle', onSettleEnd);

  const onSelectedEnd = (selectedData) => {
    fxSettle.begin({
      selected: selectedData
    });
  };

  let fxSelected = new Fx(data, 'selected', onSelectedEnd);


  this.stack = n => data.stacks[n];
  this.drawStack = () => data.drawStack;
  this.showStack = () => data.showStack;

  this.deal = () => {
    data.showStack.forEach(_ => data.drawStack.unshift(_));

    let card = data.drawStack.pop();

    data.showStack = [];
    data.showStack.push(card);
  };

  this.selectDraw = (epos, decay) => {
    let card = data.showStack[0];
    fxSelected.begin({
      epos,
      decay,
      draw: true,
      stack: [card]
    });
  };

  this.select = (stackN, cardN, epos, decay) => {
    let stack = data.stacks[stackN];
    let cards = stack.front.splice(cardN, stack.front.length - cardN);
    fxSelected.begin({
      epos,
      decay,
      dstStackN: stackN,
      stackN,
      cardN,
      stack: cards
    });
  };

  const endSelect = (srcStackN, dstStackN, srcStackView) => {
    let dstStack = data.stacks[dstStackN];
    let srcStack = data.stacks[srcStackN];
    
    srcStackView.forEach(_ => {
      dstStack.front.push(_);
    });
  };

  this.moveSelect = (epos) => {
    let sValue = fxSelected.value();
    if (sValue) {
      sValue.epos = epos;
    }
  };

  this.endSelect = (dstStackN) => {
    let sValue = fxSelected.value();
    if (sValue) {
      sValue.dstStackN = dstStackN;
    }
  };


  this.endTap = () => {
    fxSelected.end();
  };

  let deck = makeOneDeck();

  const makeStack = (n, empty) => {
    let hidden = [];
    for (let i = 0; i < empty; i++) {
      hidden.push(deck.draw());
    }
 
    return {
      n,
      hidden,
      front: [deck.draw()]
    };
  };

  this.init = () => {
    deck.shuffle();

    data.stacks = [
      makeStack(0, 0),
      makeStack(1, 1),
      makeStack(2, 2),
      makeStack(3, 3),
      makeStack(4, 4),
      makeStack(5, 5),
      makeStack(6, 6)
    ];

    data.drawStack = deck.drawRest();
    data.showStack = [];
  };


  const updateFxs = (delta) => {
    fxSelected.update(delta);
    fxSettle.update(delta);
  };

  this.update = (delta) => {
    updateFxs(delta);
  };
}
