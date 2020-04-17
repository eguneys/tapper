import { dContainer } from '../asprite';

import FutureFuture from '../future';
import FutureUser from './futureuser';

import FutureTimeline from './futuretimeline';
import FutureTimes from './futuretimes';
import FutureCrab from './futurecrab';
import FutureShoots from './futureshoots';
import FutureMessage from './futuremessage';

export default function FutureGame(play, ctx, bs) {

  let future = new FutureFuture(bs);

  let dTimes = new FutureTimes(this, ctx, bs);
  let user = new FutureUser(this, ctx, bs);
  let dTimeline = new FutureTimeline(this, ctx, bs);

  let dShoots = new FutureShoots(this, ctx, bs);
  let dCrab = new FutureCrab(this, ctx, bs);

  let dMessage = new FutureMessage(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dTimes.add(container);
    components.push(dTimes);
    dTimes.move(bs.room.x, bs.room.y);

    dShoots.add(container);
    components.push(dShoots);

    dCrab.add(container);
    components.push(dCrab);

    dMessage.add(container);
    components.push(dMessage);

    dTimeline.add(container);
    components.push(dTimeline);
    dTimeline.move(bs.timeline.x, bs.timeline.y);
  };
  initContainer();

  this.init = data => {
    future.init();
    
    user.init({future});
    dTimeline.init({future});
    dTimes.init({future});

    dCrab.init({ future });
    dShoots.init({ future });

    dMessage.init({ future });
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
