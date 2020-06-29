import * as math from './math';
import iPol from '../ipol';
import AContainer from './acontainer';

export const Transitions = {
  Fade: 'fade',
  SlideDown: 'slidedown',
  Scale: 'scale'
};


export default function AFadingContent(play, ctx, bs) {

  let { content, transition = Transitions.Fade } = bs;

  let iTransition = new iPol(0, 0, {});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(content);
  };
  initContainer();

  this.transition = (on) => {
    container.showStartUpdate();
    if (on) {
      iTransition.value(iTransition.value());
      iTransition.target(1);
    } else {
      iTransition.value(iTransition.value());
      iTransition.target(0);
      
    }
  };

  this.init = (data) => {
    
  };

  this.update = delta => {
    iTransition.update(delta / 100);
    if (iTransition.value() === 0 && iTransition.settled()) {
      container.hideStopUpdate();
    }
    this.container.update(delta);
  };

  let topOffsetY = -bs.height;
  this.render = () => {
    let vTransition = iTransition.value();

    if (transition === Transitions.Fade) {
      container.alpha(vTransition);
    } else if (transition === Transitions.SlideDown) {
      let offsetY = (1.0 - vTransition) * topOffsetY;
      
      this.container.moveY(offsetY);
    } else if (transition === Transitions.Scale) {

      this.container.scale(vTransition, vTransition);

    }

    if (vTransition === 0) {
      this.container.visible(false);
    } else {
      this.container.visible(true);
    }

    this.container.render();
  };
}
