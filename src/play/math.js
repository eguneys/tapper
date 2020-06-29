// https://stackoverflow.com/questions/14627566/rounding-in-steps-of-20-or-x-in-javascript
export function round(number, increment) {
  return Math.round(number / increment) * increment;
}
