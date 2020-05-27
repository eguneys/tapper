export default function SpiderDrawDeck(spider) {

  let deck;
  
  this.init = data => {
    deck = data;
  };

  this.nbDeck = () => deck.length;

  this.canDraw = () => this.nbDeck() > 0;

  this.drawOne = () => {
    return deck.pop();
  };

  this.dealDraw1 = this.drawOne;

  this.drawBatch = () => {
    let res = [];
    for (let i = 0; i < 10; i++) {
      res.push(deck.pop());
    }
    return res;
  };

}
