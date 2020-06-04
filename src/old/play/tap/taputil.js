const onek = 1000;
const million = onek * onek;

const divisors = {
  '': Math.pow(1000, 0), // 1000^0 == 1
  'K': Math.pow(1000, 1), // Thousand
  'M': Math.pow(1000, 2), // Million
  'B': Math.pow(1000, 3), // Billion
  'T': Math.pow(1000, 4), // Trillion
  'Qa': Math.pow(1000, 5), // Quadrillion
  'Qi': Math.pow(1000, 6) // Quintillion
};

// Shortens a number and attaches K, M, B, etc. accordingly
export function shortenNumber(number) {

  let divisor,
      shorthand;

  // Loop through each $divisor and find the
  // lowest amount that matches
  for (let _ in divisors) {
    shorthand = _;
    divisor = divisors[shorthand];

    if (Math.abs(number) < (divisor * 1000)) {
      // We found a match!
      break;
    }
  }

  // We found our match, or there were no matches.
  // Either way, use the last defined value for $divisor.
  return formatNumber(number / divisor) + shorthand;
}

export function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
