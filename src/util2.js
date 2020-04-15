export function objForeach(obj, f) {
  for (let key of Object.keys(obj)) {
    f(key, obj[key]);
  }
}

export function objMap(obj, f) {
  let res = {};

  Object.keys(obj).forEach(key => {
    res[key] = f(key, obj[key]);
  });
  return res;
};

export function objFilter(obj, filter) {
  const res = {};
  for (let key of Object.keys(obj)) {
    if (filter(key, obj[key])) {
      res[key] = obj[key];
    }
  }
  return res;
}

export function objFind(obj, p) {
  return Object.keys(obj).find(key => p(key, obj[key]));
}
