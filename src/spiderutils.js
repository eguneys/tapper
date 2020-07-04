import { writeStack, readStack } from './fen';

export const stackPlate = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export { CardStack as SpiStack } from './cutils';

export { isN } from './cutils';

const canOrderedMove = (c1, c2) =>
      c1.suit === c2.suit && c1.sRank === c2.sRank + 1;

const canStack = (c1, c2) =>
      c1.sRank === c2.sRank + 1;

export const canEndStack = (stack) => {
  return orderedLowestCardN(stack) === 12;
};

export const canAddToStack = (stack, cards) => {
  let t = stack.topCard(),
      t2 = cards[0];

  if (!t) {
    return true;
  }

  return canStack(t, t2);
};

export const canMoveStackWithCardN = (stack, cardN) => {
  let lowestN = orderedLowestCardN(stack);
  return cardN >= lowestN;
};

export const orderedLowestCardN = (stack) => {
  let front = stack.front;

  let res = 0;

  let runCard;

  for (let i = front.length - 1; i >= 0; i--) {
    let card = front[i];

    if (runCard) {
      if (!canOrderedMove(card, runCard)) {
        return i + 1;
      }
    }
    runCard = front[i];
  }
  return 0;
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

  this.undealOne = (card) => {
    cards.push(card);
  };

  this.write = () => {
    return writeStack(cards);
  };

  this.read = (e) => {
    cards = readStack(e);
  };
}
