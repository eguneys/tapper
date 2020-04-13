import { dContainer } from '../asprite';

import FutureFuture from '../future';
import FutureTimeline from './futuretimeline';
import FutureUser from './futureuser';

export default function FutureGame(play, ctx, bs) {

  let future = new FutureFuture();

  let user = new FutureUser(this, ctx, bs);
  let dTimeline = new FutureTimeline(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dTimeline.add(container);
    components.push(dTimeline);
    dTimeline.move(bs.timeline.x, bs.timeline.y);
  };
  initContainer();

  this.init = data => {
    future.init({ time: 4, vision: 0 });
    
    user.init({});
    dTimeline.init({ future });
  };


  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    future.update(delta);
    user.update(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };
}
