export const stackPlate = [0, 1, 2, 3, 4, 5, 6];
export const holePlate = [0, 1, 2, 3];

export const isUndefined = n => n === undefined;

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
    return false;
  };
}

export function SoliDrawDeck() {
  
  let inDrawing;

  let deck;
  let showStack = [];

  this.init = (data) => {
    deck = data;
    showStack = [];
  };

  this.nbDeck = () => {
    if (!deck) return 0;
    return deck.length;
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

  this.dealOne1 = () => {
    return deck.pop();
  };

  this.dealOne2 = (card) => {
    showStack.push(card);
  };

  this.dealOne12 = () => {
    let card = deck.pop();
    showStack.push(card);
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

}
