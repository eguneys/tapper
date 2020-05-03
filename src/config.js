export default function(options) {

  let defaults = {
    assetsBase: 'assets/images/'
  };


  merge(defaults, options);
  return defaults;
};


export function merge(base, extend) {
  for (var key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) {
      merge(base[key], extend[key]);
    } else {
      base[key] = extend[key];
    }
  }
}

function isObject(o) {
  return typeof o === 'object';
}
