export function intersects(r1, r2) {
  if (r1.x >= r2.x + r2.w || r2.x >= r1.x + r1.w) {
    return false;
  }
  if (r1.y >= r2.y + r2.h || r2.y >= r1.y + r1.h) {
    return false;
  }
  return true;
}
