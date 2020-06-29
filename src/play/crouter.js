import AContainer from './acontainer';
import CScreenTransition from './cscreentransitionblack';
import CEmptyContainer from './cemptycontainer';

export default function CRouter(play, ctx, bs) {

  let { routes } = bs;

  let dContentContainer = new CEmptyContainer(this, ctx, bs);

  let dScreenTransition = new CScreenTransition(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dContentContainer);
    container.addChild(dScreenTransition);
  };
  initContainer();

  this.init = (data) => {
    
  };

  let dLastView;
  const changeView = dView => {
    if (dLastView) {
      dLastView.forEach(_ => {
        _.remove();
        dContentContainer.container.removeChild(_);
      });
    }
    dLastView = dView;

    dView.forEach(_ => {
      dContentContainer.container.addChild(_);
      _.init();
    });
    let sideView = dView[1];
    sideView.container.move(bs.bar.x, bs.bar.y);
  };

  this.route = route => {
    let views = routes[route];
    dScreenTransition.init(() => {
      changeView(views);
    });
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
