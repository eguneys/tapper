import * as v from '../vec2';

export default function Line(a, b) {
  this.A = a;
  this.B = b;

  let mid = this.Mid = [(a[0] + b[0]) / 2,
                        (a[1] + b[1]) / 2];

  let dX = b[0] - a[0],
      dY = b[1] - a[1];

  this.translate = 

  // https://stackoverflow.com/questions/60659492/how-to-shorten-a-line-with-points-a-b
  this.scale = t => {
    let c = v.add(v.cscale(a, (1 - t)), v.cscale(b, t)),
        d = v.add(v.cscale(a, t), v.cscale(b, (1 - t)));

    return new Line(c, d);
  };

  // https://stackoverflow.com/questions/60659008/how-to-set-control-points-of-a-bezier-curve-to-bend-a-line
  this.pointFrom = (along, dist) => {
    let x = a[0] + dX * along - dY * dist,
        y = a[1] + dY * along + dX * dist;

    return [x, y];
  };

}

export function line(a, b) {
  return new Line(a, b);
}
