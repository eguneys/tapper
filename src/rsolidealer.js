import { End, fromBinder } from 'baconjs';

export default function RSoliDealer() {

  const dealsData = [0, 1, 2, 3, 4, 5, 6];

  let i = 0;
  let deals = dealsData.slice(0);
  let done = false;

  return fromBinder(function(sink) {
    while (!done) {

      let deal = deals[i];
      let dealI = i;
      deals[i]--;

      let count = 0;
      do {
        i = (i + 1) % dealsData.length;

        if (count++ > dealsData.length) {
          done = true;
          break;
        }
      } while (deals[i] < 0);

      if (deal === 0) {
        sink({
          i: dealI,
          hidden: false
        });
      } else {
        sink({
          i: dealI,
          hidden: true
        });
      }
    }

    sink(new End());
    
    return function() {
      
    };
  });

}
