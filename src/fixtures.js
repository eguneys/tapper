import { 
  stackPlate as spiderStackPlate,
  SpiDrawDeck,
  SpiStack
} from './spiderutils';

import { stackPlate, 
         holePlate,
         SoliStack,
         SoliHole,
         SoliDrawDeck } from './soliutils';

import { makeCard, ranks } from './deck';

const oneSpiderDeal = () => {
  return spiderStackPlate.map(_ => makeCard('diamonds', 'king'));
};

const wholeSuit = (suit, _ranks = ranks) => {
  return _ranks.map(rank => makeCard(suit, rank));
};

const queenOfDiamonds = makeCard('diamonds', 'queen');

const kingOfDiamonds = makeCard('diamonds', 'king');

const aceToQueenDiamonds = wholeSuit('diamonds', 
                                     ranks.slice(0, 12));

const aSuit = wholeSuit('diamonds',
                        ranks
                        .slice(0)
                        .reverse());

const Hearts = wholeSuit('hearts'),
      Clubs = wholeSuit('clubs'),
      Spades = wholeSuit('spades');

export default function Fixtures() {

  this.playEnding = soliEnding();

  this.playSpiderEmptyColumn = spiderEmptyColumn();

  this.spiderEnding = spiderEnding();
 
}

function spiderEnding() {
  let stacks = spiderStacksEnding();

  let drawer = makeSpiderDrawer(oneSpiderDeal());

  return writeSpider(stacks, drawer);
}

function spiderEmptyColumn() {

  let stacks = spiderStacksOneEmptyColumn();
  
  let drawer = makeSpiderDrawer(oneSpiderDeal());

  return writeSpider(stacks, drawer);
};

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

function makeSpiderDrawer(cards) {
  let res = new SpiDrawDeck();
  res.init(cards);
  return res;
}

function makeSpiderStack(front) {
  return new SpiStack([], front);
}

function spiderStacksEnding() {
  let halfSuit = aSuit.slice(0, 5);
  let restSuit = aSuit.slice(5, 13);

  let halfStacks = spiderStackPlate
      .slice(0, 5)
      .map(_ => makeSpiderStack(halfSuit));

  let otherHalf = spiderStackPlate
      .slice(0, 5)
      .map(_ => makeSpiderStack(restSuit));

  return [...halfStacks, ...otherHalf];
}

function spiderStacksOneEmptyColumn() {
  
  let rest = spiderStackPlate
      .slice(2, spiderStackPlate.length)
      .map(_ => makeSpiderStack([kingOfDiamonds, queenOfDiamonds]));

  let onestack = makeSpiderStack([]);

  return [...rest, onestack, onestack];  
}

// same as writeState in gsolitaire
function writeSolitaire(stacks, holes, drawer) {
  const fWrite = _ => _.write();

  let eStacks = stacks.map(fWrite),
      eHoles = holes.map(fWrite),
      eDrawer = fWrite(drawer);

  return `${eStacks.join('!')} ${eHoles.join('!')} ${eDrawer}`;
}


// same as writeState in gspider
function writeSpider(stacks, drawer) {
  const fWrite = _ => _.write();

  let eStacks = stacks.map(fWrite),
      eDrawer = fWrite(drawer);

  return `${eStacks.join('!')} ${eDrawer}`;
}
