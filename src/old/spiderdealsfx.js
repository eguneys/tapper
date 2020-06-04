import { SoliFxDealDeck, SoliFxUndoDealDeck } from './solifx2';

export default function SpiderDealsFx(spider) {

  let fxData = new SoliFxDealDeck(spider);

  let fxDataUndo = new SoliFxUndoDealDeck(spider);

  const dealsData = [6, 6, 6, 6, 5, 5, 5, 5, 5, 5];

  let i = 0;
  let deals;

  let done;

  let done1,
      undoDone1;

  let sData = spider.data;

  this.init = () => {
    done = false;
    i = 0;
    deals = dealsData.slice(0);

    done1 = -1;

    undoDone1 = -1;
  };

  this.busy = () => {
    return (!done || done1 >= 0 || !undoDone1 || undoDone1 >= 0);
  };

  this.beginDeal1 = () => {
    done1 = 9;
  };

  this.beginUndoDeal1 = () => {
    undoDone1 = 9;
  };

  this.acquireUndoDeal1 = () => {
    if (undoDone1 < 0) {
      return null;
    }

    let dealI = 9 - undoDone1;
    undoDone1--;

    fxDataUndo.doBegin(dealI, false);

    return fxDataUndo;
  };

  this.acquireDeal1 = () => {
    if (done1 < 0) {
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
