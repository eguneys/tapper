import AContainer from './acontainer';
import Fipps from './fippstext';

export default function APageText(play, ctx, bs) {

  let { page, total } = bs;

  let pageText = () => `${page}`;
  let ofTotalText = ` of ${total}`;


  let dPage = new Fipps(this, ctx, {
    label: pageText(),
    size: bs.size,
    fill: 0xffffff,
    fontFamily: 'Roboto',    
  });

  let dOfTotal = new Fipps(this, ctx, {
    label: ofTotalText,
    size: bs.size,
    fill: 0xffffff,
    fontFamily: 'Roboto',
  });

  const setPageText = () => {
    dPage.text(page);
    let pageBounds = dPage.container.bounds();
    dOfTotal.container.moveX(pageBounds.width);
  };

  this.page = (_page) => {
    page = _page;
    setPageText();
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dPage);
    container.addChild(dOfTotal);
    let pageBounds = dPage.container.bounds();
    dOfTotal.container.moveX(pageBounds.width);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
