import { makeCard } from './deck';

export function writeCard(card) {
  return `${card.rank}.${card.suit}`;
}

export function writeStack(stack) {
  return stack.map(writeCard).join(',');
};


export function readCard(card) {
  let [rank, suit] = card.split('.');

  return makeCard(suit, rank);
};

export function readStack(stack) {
  if (stack === "") return [];
  return stack.split(',').map(readCard);
}
