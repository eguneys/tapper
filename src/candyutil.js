import * as v from './vec2';
import * as mu from 'mutilz';

export const cols = 6;
export const rows = 8;

export const allPos = (function() {
  const res = [];
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      res.push([j, i]);
    }
  }
  return res;
})();

export const allKeys = allPos.map(pos2key);

export const neighborPoss = pos => {
  const dirs = [[0, -1],
                [0, 1],
                [-1, 0],
                [1, 0]];

  return dirs.map(d => v.cadd(pos, d))
    .filter(([x, y]) => x >= 0 && x < cols && y >= 0 && y < rows);
};

export function pos2key(pos) {
  return pos[0] + '.' + pos[1];
};

export function key2pos(key) {
  return key.split('.').map(_ => parseInt(_));
}

export const Resources = {
  Food: 'food',
  Wood: 'wood',
  Gold: 'gold'
};

export const allResources = ['food', 'wood', 'gold'];

export const randomResource = () => mu.arand(allResources);
