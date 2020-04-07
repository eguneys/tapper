export default function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;

  let P = this.P = [x, y];

  this.move = (newX, newY) => {
    x = this.x = newX;
    y = this.y = newY;
  };

  this.containsRect = rect => 
  this.containsPoint(rect.A[0], rect.A[1]) &&
    this.containsPoint(rect.B[0], rect.B[1]) &&
    this.containsPoint(rect.C[0], rect.C[1]) &&
    this.containsPoint(rect.D[0], rect.D[1]);

  this.containsPoint = (a, b) => {
    let dx = (x - a) * (x - a);
    let dy = (y - b) * (y - b);
    return (dx + dy) <= (radius * radius);    
  };

  // (x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2
  this.intersectsCircle = circle => {
    let dx = circle.x - x,
        dy = circle.y - y,
        dr = circle.radius + radius;

    return dx * dx + dy * dy <= dr * dr;
  };
  


  this.intersectsRect = rect =>
  rect.containsPoint(P) ||
    this.intersectsLine(rect.AB) ||
    this.intersectsLine(rect.BC) ||
    this.intersectsLine(rect.CD) ||
    this.intersectsLine(rect.DA);


  this.intersectsLine = line => {
    if (this.containsPoint(line.A[0], line.A[1])) {
      return true;
    }
    if (this.containsPoint(line.B[0], line.B[1])) {
      return true;
    }
    return false;
  };

}

export function circle(x, y, radius) {
  return new Circle(x, y, radius);
}
