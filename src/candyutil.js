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

export const allCols = (row) => {
  const res = [];
  for (var i = 0; i < cols; i++) {
    res.push([i, row]);
  }
  return res;
};

export const allRows = (() => {
  const res = [];
  for (var i = 0; i < rows; i++) {
    res.push(i);
  }
  return res;
})();

export const topHalfRows = allRows.slice(0, Math.floor(rows / 2));
export const bottomHalfRows = allRows.slice(Math.floor(rows / 2), rows);

export const topHalfPoss = (() => {
  let res = [];
  topHalfRows.forEach(row => res = [...res, ...allCols(row)]);
  return res;
})();
export const bottomHalfPoss = (() => {
  let res = [];
  bottomHalfRows.forEach(row => res = [...res, ...allCols(row)]);
  return res;
})();

export const isTopHalf = pos => {
  return topHalfRows.includes(pos[1]);
};

export const posInBounds = ([x, y]) => x >= 0 && x < cols && y >= 0 && y < rows;

export const allKeys = allPos.map(pos2key);

export const fallPoss = pos => {
  const vFallTopHalf = [0, -1],
        vFallBottomHalf = [0, 1];

  let vFall = isTopHalf(pos) ? vFallTopHalf: vFallBottomHalf;


  let res = v.cadd(pos, vFall);

  if (posInBounds(res)) {
    return res;
  } else {
    return null;
  }
};

export const neighborPoss = pos => {
  const dirs = [[0, -1],
                [0, 1],
                [-1, 0],
                [1, 0]];

  return dirs.map(d => v.cadd(pos, d))
    .filter(posInBounds);
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
