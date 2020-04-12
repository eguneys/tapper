import Pool from 'poolf';
import { makeId } from './util';

export default function Tapper() {
  return {
    upgrades: [
      makeUpgrade('first'),
      makeUpgrade('second'),
      makeUpgrade('third'),
      makeUpgrade('fourth'),
      makeUpgrade('first'),
      makeUpgrade('first')
    ]
  };
}

const upgradeId = makeId('upgrade');

const makeUpgrade = (key) => {
  let upgrade = Upgrades[key];

  return {
    key: upgradeId(),
    name: upgrade.name,
    cost: upgrade.cost,
    level: 1
  };
};

export const Upgrades = {
  'first': {
    name: 'First',
    cost: 100,
    next: 'second'
  },
  'second': {
    name: 'Second',
    cost: 1000,
    next: 'third'
  },
  'third': {
    name: 'Third',
    cost: 1000000
  },
  'fourth': {
    name: 'Fourth',
    cost: 999000
  }
};
