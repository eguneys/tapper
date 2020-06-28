import { stackPlate, 
         holePlate,
         SoliStack,
         SoliHole,
         SoliDrawDeck } from './soliutils';

import { makeCard, ranks } from './deck';

const wholeSuit = (suit, _ranks = ranks) => {
  return _ranks.map(rank => makeCard(suit, rank));
};

const kingOfDiamonds = makeCard('diamonds', 'king');

const aceToQueenDiamonds = wholeSuit('diamonds', 
                                     ranks.slice(0, 12));

const Hearts = wholeSuit('hearts'),
      Clubs = wholeSuit('clubs'),
      Spades = wholeSuit('spades');

export default function Fixtures() {

  this.playEnding = soliEnding();
 
}

function soliEnding() {
  let stacks = soliStacksOne([kingOfDiamonds]);

  let holes = [
    makeSoliHole(Hearts),
    makeSoliHole(Spades),
    makeSoliHole(Clubs),
    makeSoliHole(aceToQueenDiamonds)
  ];

  let drawer = makeSoliDrawer();

  return writeSolitaire(stacks, holes, drawer);
};

function soliStacksOne(cards) {
  let rest = stackPlate
    .slice(1, stackPlate.length)
      .map(_ => makeSoliStack());

  let onestack = makeSoliStack(cards);

  return [...rest, onestack];
}

function makeSoliStack(front) {
  return new SoliStack([], front);
}

function makeSoliDrawer() {
  return new SoliDrawDeck();
}

function makeSoliHole(cards) {
  return new SoliHole(cards);
}

// same as writeState in gsolitaire
function writeSolitaire(stacks, holes, drawer) {
  const fWrite = _ => _.write();

  let eStacks = stacks.map(fWrite),
      eHoles = holes.map(fWrite),
      eDrawer = fWrite(drawer);

  return `${eStacks.join('!')} ${eHoles.join('!')} ${eDrawer}`;
}
