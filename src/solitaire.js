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
      dstStackN,
      dstHole
    } = selected;

    if (dstHole || dstHole === 0) {
      if (draw) {
        endSelectHoleDraw(dstHole, stack);
      } else {
        endSelectHole(stackN, dstHole, stack);
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
      draw,
      stackN,
      cardN,
      stack,
      dstStackN,
      dstHole
    } = selectedData;

    if (dstHole) {
      let hole = data.holes[dstHole];
      let card = stack[0];
      if (!hole.canAdd(card)) {
        delete selectedData.dstHole;
      }
    }

    fxSettle.begin({
      selected: selectedData
    });
  };

  let fxSelected = new Fx(data, 'selected', onSelectedEnd);

  const onRevealEnd = ({ n, card }) => {
    let stack = data.stacks[n];
    stack.front.push(card);
  };

  let fxReveal = new Fx(data, 'reveal', onRevealEnd);


  const onAddHoleEnd = ({ dstHole, card }) => {
    let hole = data.holes[dstHole];

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

  this.selectDraw = (epos, decay) => {

    if (fxSelected.value() || fxSettle.value()) {
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

    if (fxSelected.value() || fxSettle.value()) {
      return;
    }

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

    revealStack(srcStack);
  };

  const endSelectDraw = (dstStackN, srcStackView) => {
    if (dstStackN || dstStackN === 0) {
      let dstStack = data.stacks[dstStackN];
      
      srcStackView.forEach(_ => {
        dstStack.front.push(_);
      });
    } else {
      srcStackView.forEach(_ => {
        data.showStack.push(_);
      });
    }
  };

  const endSelectHole = (srcStackN, dstHole, stack) => {
    let srcStack = data.stacks[srcStackN];
    revealStack(srcStack);

    endSelectHoleBase(dstHole, stack);
  };

  const endSelectHoleDraw = (dstHole, stack) => {
    endSelectHoleBase(dstHole, stack);
  };

  const endSelectHoleBase = (dstHole, stack) => {
    let card = stack[0];

    let hole = data.holes[dstHole];

    fxAddHole.begin({
      dstHole,
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
      sValue.dstHole = n;
    }
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
    if (stack.front.length !== 0 ||
        stack.hidden.length === 0) {
      return;
    }

    let last = stack.hidden.pop();
    fxReveal.begin({ n: stack.n,
                     card: last });
  };


  const updateFxs = (delta) => {
    fxSelected.update(delta);
    fxSettle.update(delta);
    fxReveal.update(delta);
    fxAddHole.update(delta);
  };

  const updateStacks = delta => {
  };

  this.update = (delta) => {
    updateStacks(delta);
    updateFxs(delta);
  };
}

function SoliHole(cards) {

  this.top = () => cards[cards.length - 1];

  this.add = card => {
    cards.push(card);
  };

  this.canAdd = (card) => {
    return true;
  };

  this.isDone = () => {
    return false;
  };
}
