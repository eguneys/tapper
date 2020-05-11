import { makeOneDeck } from './deck';
import Fx from './fxs';

export function isIndex(n) { return n || n === 0; };

export default function Solitaire() {

  let data = this.data = {
  };

  const onSettleEnd = ({
    selected
  }) => {

    let {
      holeN,
      draw,
      stackN,
      cardN,
      stack,
      dstStackN,
      dstHoleN
    } = selected;

    if (isIndex(holeN)) {
      endSelectHoleHole(dstHoleN, stack);
    } else if (isIndex(dstHoleN)) {
      if (draw) {
        endSelectHoleDraw(dstHoleN, stack);
      } else {
        endSelectHole(stackN, dstHoleN, stack);
      }
    } else if (draw) {
      endSelectDraw(dstStackN, stack);
    } else {
      endSelect(stackN, dstStackN, stack);
    }
  };

  let fxSettle = new Fx(data, 'settle', onSettleEnd);

  const onSelectedEnd = (selectedData) => {
    let {
      holeN,
      draw,
      stackN,
      cardN,
      stack,
      dstStackN,
      dstHoleN
    } = selectedData;

    if (isIndex(dstHoleN)) {
      if (isIndex(holeN)) {
        selectedData.dstHoleN = holeN;
      } else {
        let dHole = data.holes[dstHoleN];
        let card = stack[0];
        if (!dHole.canAdd(card)) {
          delete selectedData.dstHoleN;
        }
      }
    }

    if (isIndex(dstStackN)) {
      let dstStack = data.stacks[dstStackN];
      if (!dstStack.canAdd(stack)) {
        if (isIndex(holeN)) {
          selectedData.dstHoleN = holeN;
        } else if (draw) {
          selectedData.dstStackN = undefined;
        } else {
          selectedData.dstStackN = selectedData.stackN;
        }
      }
    }

    fxSettle.begin({
      selected: selectedData
    });
  };

  let fxSelected = new Fx(data, 'selected', onSelectedEnd);

  const onRevealEnd = ({ n, card }) => {
    let stack = data.stacks[n];
    stack.add1([card]);
  };

  let fxReveal = new Fx(data, 'reveal', onRevealEnd);


  const onAddHoleEnd = ({ dstHoleN, card }) => {
    let hole = data.holes[dstHoleN];

    hole.add(card);
  };

  let fxAddHole = new Fx(data, 'addhole', onAddHoleEnd);

  this.stack = n => data.stacks[n];
  this.drawStack = () => data.drawStack;
  this.showStack = () => data.showStack;
  this.hole = n => data.holes[n];

  this.deal = () => {
    data.showStack.forEach(_ => data.drawStack.unshift(_));

    let card = data.drawStack.pop();

    data.showStack = [];
    data.showStack.push(card);
  };

  this.selectHole = (n, epos, decay) => {
    if (busyFxs()) {
      return;
    }

    let hole = data.holes[n];

    if (!hole.canRemove()) {
      return;
    }

    let card = hole.remove();

    fxSelected.begin({
      epos,
      decay,
      holeN: n,
      dstHoleN: n,
      stack: [card]
    });
  };

  this.selectDraw = (epos, decay) => {

    if (busyFxs()) {
      return;
    }

    let card = data.showStack.pop();

    fxSelected.begin({
      epos,
      decay,
      draw: true,
      stack: [card]
    });
  };

  this.select = (stackN, cardN, epos, decay) => {

    if (busyFxs()) {
      return;
    }

    let stack = data.stacks[stackN];
    let cards = stack.cut1(cardN);
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
    
    dstStack.add1(srcStackView);
    revealStack(srcStack);
  };

  const endSelectDraw = (dstStackN, srcStackView) => {
    if (dstStackN || dstStackN === 0) {
      let dstStack = data.stacks[dstStackN];
      
      dstStack.add1(srcStackView);

    } else {
      srcStackView.forEach(_ => {
        data.showStack.push(_);
      });
    }
  };

  const endSelectHole = (srcStackN, dstHoleN, stack) => {
    let srcStack = data.stacks[srcStackN];

    revealStack(srcStack);

    endSelectHoleBase(dstHoleN, stack);
  };

  const endSelectHoleDraw = (dstHoleN, stack) => {
    endSelectHoleBase(dstHoleN, stack);
  };

  const endSelectHoleHole = (dstHoleN, stack) => {
    let hole = data.holes[dstHoleN];
    let card = stack[0];

    hole.add(card);
  };

  const endSelectHoleBase = (dstHoleN, stack) => {
    let card = stack[0];

    let hole = data.holes[dstHoleN];

    fxAddHole.begin({
      dstHoleN,
      card
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

  this.endSelectHole = (n) => {
    let sValue = fxSelected.value();
    if (sValue) {
      sValue.dstHoleN = n;
    }
  };

  let deck = makeOneDeck();

  const makeStack = (n, empty) => {
    let hidden = [];
    for (let i = 0; i < empty; i++) {
      hidden.push(deck.draw());
    }
 
    let front = [deck.draw()];

    return new SoliStack(n, hidden, front);
  };

  const makeHole = (cards) => {
    return new SoliHole(cards);
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

    data.holes = [
      makeHole([]),
      makeHole([]),
      makeHole([]),
      makeHole([])
    ];
  };

  const revealStack = stack => {
    if (!stack.canReveal()) {
      return;
    }

    let last = stack.reveal1();
    fxReveal.begin({ n: stack.n,
                     card: last });
  };


  const updateFxs = (delta) => {
    fxSelected.update(delta);
    fxSettle.update(delta);
    fxReveal.update(delta);
    fxAddHole.update(delta);
  };

  const busyFxs = () => {
    return fxSelected.value() ||
      fxSettle.value() ||
      fxReveal.value() ||
      fxAddHole.value();
  };

  const updateStacks = delta => {
  };

  this.update = (delta) => {
    updateStacks(delta);
    updateFxs(delta);
  };
}

function SoliStack(n, hidden, front) {
  
  this.n = n;
  this.front = front;
  this.hidden = hidden;

  this.cut1 = n => front.splice(n, front.length - n);


  this.add1 = cards => {
    cards.forEach(_ => front.push(_));
  };

  this.reveal1 = () => {
    return hidden.pop();
  };

  this.canAdd = cards => {
    return false;
  };

  this.canReveal = () => front.length === 0 && hidden.length > 0;

}

function SoliHole(cards) {

  this.top = () => cards[cards.length - 1];

  this.remove = () => cards.pop();

  this.add = card => {
    cards.push(card);
  };

  this.canRemove = () => cards.length > 0;

  this.canAdd = (card) => {
    return true;
  };

  this.isDone = () => {
    return false;
  };
}
