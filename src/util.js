export function noop() { };

export const callMaybe = (fn, ...args) => {
  if (fn) { fn(...args);  }
};

export const throttle = (fn, delay = 50) => {
  let called = false;
  return (...args) => {
    if (!called) {
      called = true;
      fn(...args);
      setTimeout(() => called = false, delay);
    }
  };
};

export const pDelay = d => {
  return new Promise(resolve => 
    setTimeout(resolve, d));
};

export function withDelay(fn, delay, { onUpdate }) {
  let lastUpdate = 0;

  return (delta) => {
    lastUpdate += delta;
    if (lastUpdate >= delay) {
      fn();
      lastUpdate = 0;
    } else {
      if (onUpdate)
        onUpdate(lastUpdate / delay);
    }
  };
};

export const safeRemoveFromArray = (arr, item) => {
  let i = arr.indexOf(item);
  if (i > -1) {
    arr.splice(i, 1);
  }
};

export const makeId = (prefix) => {
  let n = 1;
  return () => {
    return prefix + n++;
  };
};

export const memo = (fn) => {
  let v;
  const ret = () => {
    if (v === undefined) v = fn();
    return v;
  };
  ret.clear = () => { v = undefined; };
  return ret;
};
