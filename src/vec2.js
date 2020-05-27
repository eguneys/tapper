export function vec2(a = 0, b = a) {
  return [a, b];
}

export function copy(v1, v2 = []) {
  v2[0] = v1[0];
  v2[1] = v1[1];
  return v2;
}

export function equal(v0, v1) {
  return v0[0] === v1[0] &&
    v0[1] === v1[1];
}

export function limit(v0, limits) {
  v0[0] = Math.max(v0[0], limits[0]);
  v0[0] = Math.min(v0[0], limits[1]);
  v0[1] = Math.max(v0[1], limits[2]);
  v0[1] = Math.min(v0[1], limits[3]);
};

export function makeMap(f) {
  return v0 => {
    v0[0] = f(v0[0]);
    v0[1] = f(v0[1]);
    return v0;
  };
};

export const round = makeMap(_ => Math.round(_));

export function makeAttribute(v) {
  return (a = v[0], b = v[1]) => {
    v[0] = a;
    v[1] = b;
    return v;
  };
}

export function add(v0, v1, ...vs) {
  v0[0] += v1[0];
  v0[1] += v1[1];

  vs.forEach(_ => {
    v0[0] += _[0];
    v0[1] += _[1];
  });

  return v0;
}

export function sub(v0, v1) {
  v0[0] -= v1[0];
  v0[1] -= v1[1];
  return v0;
}

export function mul(v0, v1) {
  v0[0] *= v1[0];
  v0[1] *= v1[1];
  return v0;
}

export function div(v0, v1) {
  v0[0] /= v1[0];
  v0[1] /= v1[1];
  return v0;
}

export function scale(v0, s) {
  v0[0] *= s;
  v0[1] *= s;
  return v0;
}

export function setScale(v0, v1, s) {
  v0[0] = v1[0] * s;
  v0[1] = v1[1] * s;
}

export function addScale(v0, v1, s) {
  v0[0] += v1[0] * s;
  v0[1] += v1[1] * s;
  return v0;
}

export function length(v0) {
  return Math.sqrt(v0[0] * v0[0] +
                   v0[1] * v0[1]);
}

export function distance(v0, v1) {
  let d0 = v0[0] - v1[0],
      d1 = v0[1] - v1[1];
  return Math.sqrt(d0 * d0 + d1 * d1);
}

export function normalize(v0) {
  scale(v0, 1/length(v0));
  
  return v0;
}

export function direction(v0, v1) {
  let res = csub(v1, v0);
  return normalize(res);
}

export function cscale(v0, s) {
  return scale(copy(v0), s);
}

export function csub(v0, v1) {
  return sub(copy(v0), v1);
}

export function cadd(v0, v1) {
  return add(copy(v0), v1);
}

export function cmul(v0, v1) {
  return mul(copy(v0), v1);
}
