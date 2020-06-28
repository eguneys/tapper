import AContainer from './acontainer';

import { callMaybe } from './util';

export default function AChangingContent(play, ctx, bs) {

  let { contents } = bs;

  let selectedContentI;

  const dSelectedContent = () => contents[selectedContentI];

  this.canNext = () => selectedContentI < contents.length - 1;
  this.canBack = () => selectedContentI > 0;
  this.isLast = () => selectedContentI === contents.length - 1;

  this.first = () => setSelectedContent(0);
  this.next = () => setSelectedContent(selectedContentI + 1);
  this.back = () => setSelectedContent(selectedContentI - 1);

  let container = this.container = new AContainer();
  const initContainer = () => {
    
  };
  initContainer();

  const setSelectedContent = (i) => {
    if (selectedContentI !== undefined) {
      let oldContent = dSelectedContent();
      container.removeChild(oldContent);
    }
    selectedContentI = i;
    container.addChild(dSelectedContent());

    callMaybe(bs.onContentChanged, selectedContentI, this);
  };

  this.init = (data) => {
    this.first();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
