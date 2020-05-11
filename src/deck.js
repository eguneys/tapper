export const suits = ['spades', 'diamonds', 'hearts', 'clubs'];
export const ranks = ['ace',
                      'two',
                      'three',
                      'four',
                      'five',
                      'six',
                      'seven',
                      'eight',
                      'nine',
                      'ten',
                      'jack',
                      'queen',
                      'king'];

const solitaireIndexByRank = {
  'ace': 0,
  'two': 1,
  'three': 2,
  'four': 3,
  'five': 4,
  'six': 5,
  'seven': 6,
  'eight': 7,
  'nine': 8,
  'ten': 9,
  'jack': 10,
  'queen': 11,
  'king': 12
};

const colorsBySuit = {
  'spades': 'black',
  'diamonds': 'red',
  'hearts': 'red',
  'clubs': 'black'
};

const makeCard = (suit, rank) => ({
  sRank: solitaireIndexByRank[rank],
  color: colorsBySuit[suit],
  suit,
  rank
});

export const allRanks = suit => ranks.map(_ => makeCard(suit, _));

export const oneDeck = suits.flatMap(allRanks);

export const makeOneDeck = () => new Deck(oneDeck);

/** https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function Deck(deck) {

  this.test = () => {
    deck = deck.slice(0);
  };

  this.shuffle = () => {
    deck = shuffle(deck.slice(0));
  };

  this.remaining = () => deck.length;
  this.out = () => deck.length === 0;
  this.out3 = () => deck.length < 3;

  this.draw = () => deck.pop();
  this.draw3 = () => [    
    deck.pop(),
    deck.pop(),
    deck.pop()
  ];

  this.draw3Rest = () => {
    if (deck.length === 0) {
      return [];
    } else if (deck.length === 1) {
      return [deck.pop()];
    } else if (deck.length === 2) {
      return [deck.pop(),
              deck.pop()];
    } else {
      return [deck.pop(),
              deck.pop(),
              deck.pop()];
    }
  };

  this.drawRest = () => deck;
}
