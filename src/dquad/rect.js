import { line } from './line';

export function rect(x, y, w, h) {
  return new Rectangle(x, y, w, h);
}

export default function Rectangle(x, y, w, h) {

  this.width = w;
  this.height = h;

  let x1,y1,
      A,B,C,D;

  this.copy = () => {
    return new Rectangle(x, y, w, h);
  };

  this.move = (newX, newY) => {
    x = this.x = newX;
    y = this.y = newY;

    x1 = this.x1 = x + w;
    y1 = this.y1 = y + h;

    A = this.A = [x, y];
    B = this.B = [x, y1];
    C = this.C = [x1, y1];
    D = this.D = [x1, y];

    this.AB = line(A, B);
    this.BC = line(B, C);
    this.CD = line(C, D);
    this.DA = line(D, A);
  };

  this.move(x, y);

  this.contains = r1 =>
  x < r1.x && y < r1.y && 
    x1 > r1.x1 && y1 > r1.y1;

  this.intersects = r1 => {
    if (x > r1.x1 || r1.x > x1) {
      return false;
    }
    if (y > r1.y1 || r1.y > y1) {
      return false;
    }
    return true;
  };

  this.containsPoint = (pX, pY) => pX > x && pX < x1 &&
    pY > y && pY < y1;
  
}
