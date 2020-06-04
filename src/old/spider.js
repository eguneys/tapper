import { makeOneDeck, oneSuitDeckRaw, twoSuitDeckRaw } from './deck';

import Fx from './fxs';

import * as spiderfx from './spiderfx';

import SpiderDealsFx from './spiderdealsfx';
import SpiderDrawDeck from './spiderdrawdeck';
import Undos from './undos';

export default function Spider() {

  const decksByOption = {
    'onesuit': [makeOneDeck(oneSuitDeckRaw()),
                makeOneDeck(oneSuitDeckRaw())],
    'twosuits': [makeOneDeck(twoSuitDeckRaw()),
                 makeOneDeck(twoSuitDeckRaw())],
    'foursuits': [makeOneDeck(),
                  makeOneDeck()]
  };

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

  let undos = this.undos = new Undos();

  let dealsFxer = new SpiderDealsFx(this);

  const onDealEnd = (fxDataEnd) => {
    fxDataEnd.doEnd();
  };

  let fxDeal = new Fx(data, 'deal', onDealEnd);

  const onFxDataEnd = (fxData) => {
    fxData.doEnd();
  };
  
  let fxUndoDeal = new Fx(data, 'undodeal', onFxDataEnd);


  const onSettleEnd = (fxData) => {
    fxData.doEnd();
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

  let fxDataSelectedStack = new spiderfx.SpiderFxSelectedStack(this);

  const onRevealEnd = ({ n, card }) => {
    let stack = data.stacks[n];
    stack.add1([card]);
  };

  let fxReveal = new Fx(data, 'reveal', onRevealEnd);

  const onMoveEnd = ({ dstStackN, cards }) => {
    let destStack = data.stacks[dstStackN];

    destStack.add1(cards);
  };

  let fxMove = new Fx(data, 'move', onMoveEnd);

  const onPersistSelectEnd = ({stackN, cardN}) => {
    data.stacks[stackN].highlightCards([]);
  };

  let fxPersistSelect = new Fx(data, 'persistselect', onPersistSelectEnd);

  let allFxs = [fxDeal, 
                fxUndoDeal,
                fxSelected,
                fxSettle,
                fxReveal,
                fxMove];

  this.stack = n => data.stacks[n];
  this.drawStack = data.drawStack;

  let deck1,
      deck2;

  this.newGame = () => {
    if (busyFxs() || dealsFxer.busy()) {
      return;
    }

    this.init();
  };

  this.undo = () => {
    if (busyFxs() || dealsFxer.busy()) {
      return;
    }

    undos.undo();
  };

  this.init = (options) => {

    let suitOption = 'onesuit';

    let decks = decksByOption[suitOption];
    deck1 = decks[0];
    deck2 = decks[1];

    reset();
    beginDeal();
  };

  const reset = () => {
    allFxs.forEach(_ => _.cancel());
    fxPersistSelect.cancel();

    data.stacks.forEach(_ => _.clear());

    undos.init();
  };

  const beginDeal = () => {
    
    // deck1.shuffle();
    // deck2.shuffle();
    deck1.test();
    deck2.test();

    data.drawStack.init([...deck1.drawRest(),
                         ...deck2.drawRest()]);

    dealsFxer.init();
  };

  const undoDeal = () => {

    dealsFxer.beginUndoDeal1();

  };

  this.revealStack = stack => {
    if (!stack.canReveal()) {
      return;
    }

    let last = stack.reveal1();
    fxReveal.begin({ n: stack.n,
                     card: last });
  };

  this.moveCards = (srcStackN, dstStackN, cardN) => {
    let srcStack = data.stacks[srcStackN];
    let cards = srcStack.cut1(cardN);

    this.revealStack(srcStack);

    fxMove.begin({ srcStackN,
                   dstStackN,
                   cards });
  };

  this.beginDraw = () => {
    if (busyFxs() || dealsFxer.busy()) {
      return;
    }

    dealsFxer.beginDeal1();

    undos.push(undoDeal);
  };

  this.beginSelect = (stackN, cardN, epos, decay) => {
    if (busyFxs()) {
      return;
    }

    let stack = data.stacks[stackN];

    if (!stack.canSelect(cardN)) {
      return;
    }


    let persistSelectData = fxPersistSelect.value();
    if (persistSelectData) {
      let { stackN: srcStackN, cardN, cards } = persistSelectData;


      let dstStack = data.stacks[stackN],
          srcStack = data.stacks[srcStackN];

      if (srcStack === dstStack) {
      } else if (dstStack.canAdd(cards)) {

        this.moveCards(srcStackN, stackN, cardN);

        this.persistSelectEnd();
        return;
      }
      
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

  this.endTap = () => {
    if (!fxSelected.value()) {
      this.persistSelectEnd();
    } else {
      fxSelected.end();
    }
  };


  this.persistSelect = (stackN, cards) => {
    let stack = data.stacks[stackN];
    let cardN = stack.indexOf(cards[0]);
    //stack.highlight1(cardN);
    stack.highlightCards(cards);
    fxPersistSelect.begin({ stackN, cards, cardN });
  };

  this.persistSelectEnd = () => {
    fxPersistSelect.endNow();
  };
  
  const busyFxs = () => {
    return allFxs.some(_ => _.value());
  };

  const updateFxs = (delta) => {
    allFxs.forEach(_ => _.update(delta));

    fxPersistSelect.update(delta);

  };


  const updateDeals = delta => {
    if (busyFxs()) {
      return;
    }

    let fxData = dealsFxer.acquireDeal();
    if (fxData) {
      fxDeal.begin(fxData);
    }

    fxData = dealsFxer.acquireDeal1();
    if (fxData) {
      fxDeal.begin(fxData);
    }

    fxData = dealsFxer.acquireUndoDeal1();
    if (fxData) {
      fxUndoDeal.begin(fxData);
    }

  };

  this.update = (delta) => {
    updateDeals(delta);
    updateFxs(delta);
  };
}

const canStack = (c1, c2) => c1.sRank === c2.sRank + 1;

const canTop = c1 => true;

function SpiderStack(n, hidden = [], front = []) {
  
  this.n = n;
  this.front = front;
  this.hidden = hidden;

  let highlight;

  this.frontCard = (n) => front[n];

  this.indexOf = (card) => front.indexOf(card);

  this.highlight = () => highlight;

  this.highlightCards = (cards) => {
    highlight = cards.map(_ => this.indexOf(_));
  };

  this.cut1 = n => front.splice(n, front.length - n);

  this.hide1 = cards => {
    cards.forEach(_ => hidden.push(_));
  };

  this.add1 = cards => {
    cards.forEach(_ => front.push(_));
  };

  this.remove1 = () => {
    return front.pop();
  };

  this.clear = () => {
    front = this.front = [];
    hidden = this.hidden = [];
    highlight = undefined;
  };

  this.reveal1 = () => {
    return hidden.pop();
  };

  this.canSelect = cardN => {
    let cards = front.slice(cardN, front.length);

    return cards.every((v, i, a) => !i || a[i - 1].sRank === v.sRank + 1);
  };

  this.canAdd = cards => {
    let t = top(),
        t2 = cards[0];

    if (!t) {
      return canTop(t2);
    }

    return canStack(t, t2);
  };

  const top = () => front[front.length - 1];

  this.canReveal = () => front.length === 0 && hidden.length > 0;
}
