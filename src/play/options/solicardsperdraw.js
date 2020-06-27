import AContainer from '../acontainer';
import { text } from '../../asprite';

export default function SoliCardsPerDraw(play, ctx, bs) {

  let dLabel = text("Cards per draw", {});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.c.addChild(dLabel);
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
