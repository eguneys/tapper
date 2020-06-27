import AContainer from './acontainer';

export default function AChangingContent(play, ctx, bs) {

  let { contents } = bs;

  let selectedContentI;

  const dSelectedContent = () => contents[selectedContentI];


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
  };
  setSelectedContent(0);

  this.contentIndex = i => {
    if (i !== undefined) {
      setSelectedContent(i);
    }

    return selectedContentI;
  };

  this.canNext = () => selectedContentI < contents.length - 1;
  this.canBack = () => selectedContentI > 0;

  this.next = () => setSelectedContent(selectedContentI + 1);
  this.back = () => setSelectedContent(selectedContentI - 1);

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
