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

export const makeCard = (suit, rank) => ({
  sRank: solitaireIndexByRank[rank],
  color: colorsBySuit[suit],
  suit,
  rank
});

export const allRanks = suit => ranks.map(_ => makeCard(suit, _));

export const fourSuitDeckRaw = suits.flatMap(allRanks);

export const oneSuitDeckRaw = (suit = 'spades') => 
[suit, suit, suit, suit].flatMap(allRanks);

export const twoSuitDeckRaw = (suit1 = 'hearts', suit2 = 'spades') =>
[suit1, suit1, suit2, suit2].flatMap(allRanks);

export const makeOneDeck = (deck = fourSuitDeckRaw) => new Deck(deck);

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

export default function Deck(baseDeck) {

  let deck;

  this.test = () => {
    deck = baseDeck.slice(0);
  };

  this.shuffle = () => {
    deck = shuffle(baseDeck.slice(0));
  };

  this.debug = () => {
    let ss = suits.slice(0);

    let res = [];

    for (let c of deck) {
      if (c.rank === 'ace') {
        res.push(c.suit);
      }
    }

    res.sort();
    ss.sort();

    for (let i = 0; i < 4; i++) {
      if (res[i] !== ss[i]) {
        throw "Bad Deck " + res;
      }
    }


  };

  this.remaining = () => deck.length;

  this.draw = () => deck.pop();
  this.drawRest = () => deck;
}
