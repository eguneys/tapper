export function serialPromise() {
  let lastPromise = Promise.resolve();
  return function(fn) {
    lastPromise = lastPromise.then(fn);
  };
}
