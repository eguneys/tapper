import { SoliFxDealDeck } from './solifx2';

export default function SpiderDealsFx(spider) {

  let fxData = new SoliFxDealDeck(spider);

  const dealsData = [6, 6, 6, 6, 5, 5, 5, 5, 5, 5];

  let i = 0;
  let deals;

  let done;

  let done1;

  let sData = spider.data;

  this.init = () => {
    done = false;
    i = 0;
    deals = dealsData.slice(0);

    done1 = -1;
  };

  this.busy = () => {
    return (!done || done1 >= 0);
  };

  this.beginDeal1 = () => {
    done1 = 9;
  };

  this.acquireDeal1 = () => {
    if (done1 < 0 || !sData.drawStack.canDraw()) {
      return null;
    }

    let dealI = done1;
    done1--;

    fxData.doBegin(dealI, false);

    return fxData;
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
