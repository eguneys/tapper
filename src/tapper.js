import { makeId } from './util';
import Morphy from './tapmorphy';

export default function Tapper() {

  let morphy = new Morphy(this);

  let deltaTaps;
  let userTaps;
  let taps;
  let upgrades;

  this.deltaTaps = () => deltaTaps;
  this.taps = () => taps;
  this.upgrades = () => upgrades;
  this.morphy = () => morphy;

  this.init = () => {
    userTaps = [];
    taps = 0;

    upgrades = [
      makeUpgrade('idle')
    ];

    let morphyPos = {
      x: 100,
      y: 100
    };

    morphy.init({pos: morphyPos});
  };

  this.untap = (reason, x, y) => {
    userTaps.push(makeTap(-1, { reason, x, y }));
  };

  this.tap = (reason, x, y) => {
    userTaps.push(makeTap(+1, { reason, x, y }));
  };

  const updateTaps = () => {
    deltaTaps = userTaps;
    userTaps = [];

    for (let tap of deltaTaps) {
      taps += tap.delta;
    }
  };

  this.update = delta => {
    
    updateTaps();

    morphy.update(delta);
  };
}

const tapId = makeId('tap');

const makeTap = (delta, { reason, x, y }) => {
  return {
    key: tapId(),
    delta,
    reason,
    x,
    y
  };
};

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
  'idle': {
    name: 'Wake up',
    cost: 100
  }
};
