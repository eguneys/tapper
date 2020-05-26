import { makeOneDeck } from './deck';

export const backCard = { back: true };
export const queenHearts = { suit: 'hearts',
                             rank: 'queen' };

export const nStack = (n) => {
  let deck = makeOneDeck();
  deck.test();

  let res = [];

  for (let i = 0; i < n; i++) {
    res.push(deck.draw());
  }
  
  return res;
};

export const fullStack = nStack(20);
export const halfStack = nStack(10);
