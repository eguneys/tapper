export default function SoliDrawDeck() {
  
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
