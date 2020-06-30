export default function SpiDeal() {

  const dealsData = [6, 6, 6, 6, 5, 5, 5, 5, 5, 5];

  let i = 0;
  let deals;

  let done;

  this.init = () => {
    done = false;
    i = 0;
    deals = dealsData.slice(0);
  };

  this.acquireDeal = () => {

    if (done) {
      return null;
    }

    let deal = deals[i];
    let dealI = i;
    deals[i]--;

    let count = 0;
    do {
      i = (i + 1) % deals.length;

      if (count++ > deals.length) {
        done = true;
        break;
      }
    } while (deals[i] < 0);

    if (deal === 0) {
      return {
        i: dealI,
        hidden: false
      };
    } else {
      return {
        i: dealI,
        hidden: true
      };
    }
  };
}
