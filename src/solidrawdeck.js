export default function SoliDrawDeck() {
  
  let deck;

  this.init = (data) => {
    deck = data;
  };

  this.nb = () => deck.length;

  this.append = cards => {
    cards.forEach(_ => deck.unshift(_));
  };

  this.draw1 = () => {
    return deck.pop();
  };

}
