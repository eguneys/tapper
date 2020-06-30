export const stackPlate = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export { CardStack as SpiStack } from './cutils';

export { isN } from './cutils';

export const canAddToStack = (stack, cards) => {
  let t = stack.topCard(),
      t2 = cards[0];

  return true;
};

export function SpiDrawDeck() {

  let cards;

  this.nbDeck = () => cards?cards.length:0;

  this.init = _cards => {
    cards = _cards;
  };

  this.dealOnlyOne = () => {
    return [cards.pop()];
  };
}
