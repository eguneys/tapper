import { SoliFxDealDeck } from './solifx2';

export default function SoliDealsFx(solitaire) {

  let fxData = new SoliFxDealDeck(solitaire);

  const dealsData = [0, 1, 2, 3, 4, 5, 6];

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
      i = (i + 1) % dealsData.length;

      if (count++ > dealsData.length) {
        done = true;
        break;
      }
    } while (deals[i] < 0);

    if (deal === 0) {
      fxData.doBegin(dealI, false);
    } else {
      fxData.doBegin(dealI, true);
    }
    return fxData;
  };
}
