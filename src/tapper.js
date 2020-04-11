import Pool from 'poolf';
import { makeId } from './util';

export default function Tapper() {
  return {
    upgrades: [
      makeUpgrade('first')
    ]
  };
}

const makeUpgrade = (key) => {
  let upgrade = Upgrades[key];

  return {
    name: upgrade.name,
    maxLevel: upgrade.maxLevel,
    level: 1
  };
};

export const Upgrades = {
  'first': {
    name: 'First',
    maxLevel: 10,
    next: 'second'
  },
  'second': {
    name: 'Second',
    maxLevel: 10,
    next: 'third'
  },
  'third': {
    name: 'Third',
    maxLevel: 10
  }
};
