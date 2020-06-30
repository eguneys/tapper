import AContainer from './acontainer';
import CSidebar from './csidebar';

export default function SpiderSidebar(play, ctx, bs) {
  let gspider = play.gspider;

  let { optionsStore } = ctx;
  let dBar = new CSidebar(this, ctx, {
    onNewgame() {
      let options = optionsStore.solitaire();
      gspider.userActionNewGame(options);
    },
    onUndo() {
      gspider.userActionUndo();
    },
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBar);
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
