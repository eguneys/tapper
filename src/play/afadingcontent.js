import iPol from '../ipol';
import AContainer from './acontainer';

export default function AFadingContent(play, ctx, bs) {

  let { content } = bs;

  let iFade = new iPol(0, 0, {});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(content);
  };
  initContainer();

  this.fadeIn = (fadeIn) => {
    container.showStartUpdate();
    if (fadeIn) {
      iFade.value(iFade.value());
      iFade.target(1);
    } else {
      iFade.value(iFade.value());
      iFade.target(0);
    }
  };

  this.init = (data) => {
    
  };

  this.update = delta => {
    iFade.update(delta / 200);
    if (iFade.value() === 0 && iFade.settled()) {
      container.hideStopUpdate();
    }
    this.container.update(delta);
  };

  this.render = () => {
    let vFade = iFade.value();

    container.alpha(vFade);
    this.container.render();
  };
}
