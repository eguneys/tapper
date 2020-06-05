export const isN = n => n || n === 0;

const canStack = (c1, c2) => 
      c1.color !== c2.color && c1.sRank === c2.sRank + 1;

const canTop = c1 =>
      c1.rank === 'king';

export function SoliStack(hidden = [], front = []) {

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

export function SoliHole(cards) {

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

export function SoliDrawDeck() {
  
  let deck;
  let showStack;

  this.init = (data) => {
    deck = data;
    showStack = [];
  };

  this.nbDeck = () => deck.length;

  this.reshuffle2 = (cards) => {
    deck = cards.reverse();
  };

  this.reshuffle1 = () => {
    let cards = showStack;
    showStack = [];
    return cards;
  };

  this.dealDraw1 = () => {
    return deck.pop();
  };

  this.draw1 = () => {
    return showStack.pop();
  };

  this.drawCancel1 = (card) => {
    showStack.push(card);
  };

  this.deal1 = () => {
    let card = deck.pop();
    return card;
  };

  this.deal2 = (card) => {
    showStack.push(card);
  };

  this.showStack3 = () => {
    return showStack.slice(-3, showStack.length);
  };

}
