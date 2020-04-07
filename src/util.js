export function noop() { };

export const callMaybe = fn => {
  return (...args) => {
    if (fn) { fn(...args);  }
  };
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
