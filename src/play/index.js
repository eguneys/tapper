import { rect } from '../dquad/geometry';
import { dContainer, sprite } from '../asprite';

import FutureGame from './futuregame';


export default function Play(ctx) {

  const { textures, canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    let margin = width * 0.01;

    let timelineEntries = 9;

    let timelineW = width * 0.8,
        timelineH = timelineW / timelineEntries;

    let timeline = rect((width - timelineW) * 0.5, 
                        margin,
                        timelineW,
                        timelineH);

    return {
      timeline,
      width,
      height
    };
  })();

  let futureGame = new FutureGame(this, ctx, bs);

  let components = [];
  let container = dContainer();

  const initContainer = () => {
    futureGame.add(container);
    components.push(futureGame);
  };
  initContainer();

  this.init = data => {
    
    futureGame.init({});

  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
