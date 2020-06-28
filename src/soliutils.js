import * as ou from './optionutils';
import { writeStack, readStack } from './fen';

export const stackPlate = [0, 1, 2, 3, 4, 5, 6];
export const holePlate = [0, 1, 2, 3];

export const isN = n => (n || n === 0) && !(n < 0);

const canStack = (c1, c2) => 
      c1.color !== c2.color && c1.sRank === c2.sRank + 1;

const canTop = c1 =>
      c1.rank === 'king';

export function SoliStack(hidden = [], front = []) {

  let inProgress;

  let options = this.options = {};

  this.front = front;
  this.hidden = hidden;

  this.inProgress = () => inProgress;

  this.cutLast = () => front.pop();

  this.cut1 = n => front.splice(n, front.length - n);

  this.cutInProgress = n => {
    inProgress = true;
    return this.cut1(n);
  };

  this.cutInProgressCommit = () => {
    inProgress = false;
  };

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

  this.unreveal1 = () => {
    options.dontExtend = true;
    front.pop();
  };

  this.unreveal2 = (card) => {
    options.dontExtend = false;
    hidden.push(card);
  };

  const top = () => front[front.length - 1];

  this.topCard = () => top();

  this.canAdd = cards => {
    let t = top(),
        t2 = cards[0];

    if (!t) {
      return canTop(t2);
    }

    return canStack(t, t2);
  };

  this.canReveal = () => front.length === 0 && hidden.length > 0;


  this.write = () => {
    let eFront = writeStack(this.front);
    let eHidden = writeStack(this.hidden);

    return `${eFront};${eHidden}`;
  };

  this.read = (e) => {
    let [eFront, eHidden] = e.split(';');

    front = this.front = readStack(eFront);
    hidden = this.hidden = readStack(eHidden);
  };

}

function canStackHoleAce(c1) {
  return c1.rank === 'ace';
}

function canStackHole(c1, c2) {
  return c1.suit === c2.suit && c1.sRank === c2.sRank - 1;
}

export function SoliHole(cards = []) {

  this.top = () => cards[cards.length - 1];

  this.remove = () => cards.pop();

  this.clear = () => {
    cards = [];
  };

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
    return cards.length === 13;
  };

  this.write = () => {
    return writeStack(cards);
  };

  this.read = (e) => {
    cards = readStack(e);
  };
}

export function SoliDrawDeck() {
  
  let inDrawing;

  let deck = [];
  let showStack = [];

  let cardsPerDraw,
      noReshuffle;

  this.options = (options) => {
    let { cardsPerDraw: _cardsPerDraw } = options;

    switch (_cardsPerDraw) {
    case ou.oneCardNoReshuffle:
      cardsPerDraw = 1;
      noReshuffle = true;
      break;
    case ou.oneCard:
      cardsPerDraw = 1;
      noReshuffle = false;
      break;
    case ou.threeCards:
    default:
      cardsPerDraw = 3;
      noReshuffle = false;
    }
  };

  this.init = (data) => {
    deck = data;
    showStack = [];
  };

  this.nbDeck = () => deck.length;

  this.canShuffle = () => {
    return !noReshuffle;
  };

  this.shuffle2 = (cards) => {
    deck = cards.reverse();
  };

  this.shuffle1 = () => {
    let cards = showStack;
    showStack = [];
    return cards;
  };

  this.undoShuffle = () => {
    showStack = deck.reverse();
    deck = [];
  };

  this.dealOnlyOne = () => {
    return [deck.pop()];
  };

  this.dealOne1 = () => {
    let res = [];
    for (let i = 0; i < cardsPerDraw; i++) {

      if (deck.length === 0) {
        break;
      }

      res.push(deck.pop());

    }

    return res;
  };

  this.dealOne2 = (cards) => {
    cards.forEach(_ => showStack.push(_));
  };

  this.undealOne = () => {
    let card = showStack.pop();
    deck.push(card);
  };

  this.undoDraw = (card) => {
    inDrawing = false;
    showStack.push(card);
  };

  this.draw1 = () => {
    inDrawing = true;
    return showStack.pop();
  };

  this.drawCancel1 = (card) => {
    inDrawing = false;
    showStack.push(card);
  };

  this.drawCommit1 = () => {
    inDrawing = false;
  };

  this.topCard = () => {
    return showStack[showStack.length - 1];
  };

  this.showStack3 = () => {
    let takeLast = inDrawing?-2:-3;
    return showStack.slice(takeLast, showStack.length);
  };

  this.write = () => {
    const eDeck = writeStack(deck),
          eShow = writeStack(showStack);

    return `${eDeck};${eShow}`;    
  };

  this.read = (e) => {
    let [eDeck, eShow] = e.split(';');

    deck = readStack(eDeck);
    showStack = readStack(eShow);
  };
}
