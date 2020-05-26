import { withDelay } from './util';

import { makeOneDeck } from './deck';
import Fx from './fxs';

import * as solifx from './solifx';
import SoliDealsFx from './dealsfx';

import SoliDrawDeck from './solidrawdeck';


export function isIndex(n) { return n || n === 0; };

export default function Solitaire() {

  let data = this.data = {
    drawStack: new SoliDrawDeck(),
    stacks: [
      new SoliStack(0),
      new SoliStack(1),
      new SoliStack(2),
      new SoliStack(3),
      new SoliStack(4),
      new SoliStack(5),
      new SoliStack(6)
    ]
  };

  const onSettleEnd = (fxDataSettle) => {
    fxDataSettle.doEnd();
  };

  let fxSettle = new Fx(data, 'settle', onSettleEnd);

  const onSelectedEnd = (fxDataSelected) => {

    fxDataSelected.doEnd();

    if (!fxDataSelected.settleFx()) {
      fxDataSelected.endCancel();
    }
    let fxDataSettle = fxDataSelected.settleFx();

    fxSettle.begin(fxDataSettle);
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


  const onDealEnd = (fxDataEnd) => {
    fxDataEnd.doEnd();
  };

  let fxDeal = new Fx(data, 'deal', onDealEnd);

  let fxDataSelectedDraw = new solifx.SoliFxSelectedDraw(this),
      fxDataSelectedStack = new solifx.SoliFxSelectedStack(this),
      fxDataSelectedHole = new solifx.SoliFxSelectedHole(this);


  const onDrawDealEnd = (card) => {
    data.drawStack.deal2(card);
  };

  let fxDrawDeal = new Fx(data, 'drawdeal', onDrawDealEnd);

  const onShuffleEnd = (cards) => {
    data.drawStack.reshuffle2(cards);
  };

  let fxDrawShuffle = new Fx(data, 'drawshuffle', onShuffleEnd);


  let dealsFxer = new SoliDealsFx(this);


  this.stack = n => data.stacks[n];
  this.drawStack = data.drawStack;
  this.hole = n => data.holes[n];

  this.reshuffle = () => {
    if (busyFxs()) {
      return;
    }

    let cards = data.drawStack.reshuffle1();
    fxDrawShuffle.begin(cards);
  };

  this.deal = () => {
    if (busyFxs()) {
      return;
    }

    fxDrawDeal.begin(data.drawStack.deal1());
  };

  this.selectHole = (srcHoleN, epos, decay) => {
    if (busyFxs()) {
      return;
    }


    let hole = data.holes[srcHoleN];

    if (!hole.canRemove()) {
      return;
    }

    fxDataSelectedHole.doBegin(srcHoleN, epos, decay);
    fxSelected.begin(fxDataSelectedHole);
  };

  this.selectDraw = (epos, decay) => {

    if (busyFxs()) {
      return;
    }

    fxDataSelectedDraw.doBegin(epos, decay);
    fxSelected.begin(fxDataSelectedDraw);
  };

  this.select = (stackN, cardN, epos, decay) => {

    if (busyFxs()) {
      return;
    }

    fxDataSelectedStack.doBegin(stackN, cardN, epos, decay);
    fxSelected.begin(fxDataSelectedStack);
  };

  this.moveSelect = (epos) => {
    let fxData = fxSelected.value();
    if (fxData) {
      fxData.doUpdate(epos);
    }
  };

  this.endSelect = (dstStackN) => {
    let fxData = fxSelected.value();
    if (fxData) {
      fxData.endStack(dstStackN);
    }
  };

  this.endSelectHole = (dstHoleN) => {
    let fxData = fxSelected.value();
    if (fxData) {
      fxData.endHole(dstHoleN);
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
 
    let front = [deck.draw()];

    return new SoliStack(n, hidden, front);
  };

  const makeHole = (cards) => {
    return new SoliHole(cards);
  };

  this.undo = () => {
    data.undoUsed = true;
    data.nbMoves++;
  };

  this.newGame = () => {
    this.init();
  };

  this.init = () => {

    reset();
    beginDeal();
  };

  const beginDeal = () => {
    deck.shuffle();

    data.drawStack.init(deck.drawRest());

    dealsFxer.init();
  };


  const reset = () => {

    data.stacks.forEach(_ => _.clear());

    data.holes = [
      makeHole([]),
      makeHole([]),
      makeHole([]),
      makeHole([])
    ];

    data.nbMoves = 0;
    data.undoUsed = false;
  };

  this.revealStack = stack => {
    if (!stack.canReveal()) {
      return;
    }

    let last = stack.reveal1();
    fxReveal.begin({ n: stack.n,
                     card: last });
  };

  this.addHole = (dstHoleN, card) => {
    fxAddHole.begin({
      dstHoleN,
      card
    });
  };

  let allFxs = [fxSelected, 
                fxSettle,
                fxReveal,
                fxAddHole,
                fxDeal,
                fxDrawDeal,
                fxDrawShuffle];

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

const canStack = (c1, c2) => 
      c1.color !== c2.color && c1.sRank === c2.sRank + 1;

const canTop = c1 =>
      c1.rank === 'king';

function SoliStack(n, hidden = [], front = []) {
  
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

  this.canAdd = cards => {
    let t = top(),
        t2 = cards[0];

    if (!t) {
      return canTop(t2);
    }

    return canStack(t, t2);
  };

  this.canReveal = () => front.length === 0 && hidden.length > 0;

}

function canStackHoleAce(c1) {
  return c1.rank === 'ace';
}

function canStackHole(c1, c2) {
  return c1.suit === c2.suit && c1.sRank === c2.sRank - 1;
}

function SoliHole(cards) {

  this.top = () => cards[cards.length - 1];

  this.remove = () => cards.pop();

  this.add = card => {
    cards.push(card);
  };

  this.canRemove = () => cards.length > 0;

  this.canAdd = cards => {
    if (cards.length !== 1) {
      return false;
    }

    let t = this.top(),
        t2 = cards[0];


    if (!t) {
      return canStackHoleAce(t2);
    } else {
      return canStackHole(t, t2);
    }
  };

  this.isDone = () => {
    return false;
  };
}
