import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import FText from './ftext';

export default function FutureTimeline(play, ctx, bs) {

  const years = [
    '2000',
    '2005',
    '2010',
    '2015',
    '2020',
    '2025',
    '2030',
    '2035',
    '2040'
  ];

  const { textures } = ctx;
  const mall = textures['mall'];

  let dBegin = new TapSprite(this, ctx, {
    width: bs.timeline.height,
    height: bs.timeline.height,
    texture: mall['timeline1']
  });

  let dEnd = new TapSprite(this, ctx, {
    width: bs.timeline.height,
    height: bs.timeline.height,
    texture: mall['timeline3']
  });

  let dMiddle = new TapSprite(this, ctx, {
    width: bs.timeline.height * 7,
    height: bs.timeline.height,
    texture: mall['timeline2']
  });

  let dVisionPast = new TapSprite(this, ctx, {
    texture: mall['timeline2']
  });

  let dVisionFuture = new TapSprite(this, ctx, {
    texture: mall['timeline2']
  });

  let dVisionPastBegin = new TapSprite(this, ctx, {
    width: bs.timeline.height,
    height: bs.timeline.height,
    texture: mall['timeline1']
  });

  let dVisionFutureEnd = new TapSprite(this, ctx, {
    width: bs.timeline.height,
    height: bs.timeline.height,
    texture: mall['timeline3']
  });

  let dNow = new TapSprite(this, ctx, {
    width: bs.timeline.height,
    height: bs.timeline.height,
    texture: mall['timelineNow']
  });

  let dYear = new FText(this, ctx, {
    size: bs.timeline.height * 0.5
  });



  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBegin.add(container);
    components.push(dBegin);

    dMiddle.add(container);
    components.push(dMiddle);
    dMiddle.move(bs.timeline.height * 1, 0);

    dEnd.add(container);
    components.push(dEnd);
    dEnd.move(bs.timeline.height * 8, 0);

    dVisionPast.add(container);
    components.push(dVisionPast);
    dVisionPast.tint(0xff0000);

    dVisionFuture.add(container);
    components.push(dVisionFuture);
    dVisionFuture.tint(0xff0000);

    dVisionPastBegin.add(container);
    components.push(dVisionPastBegin);
    dVisionPastBegin.tint(0xff0000);

    dVisionFutureEnd.add(container);
    components.push(dVisionFutureEnd);
    dVisionFutureEnd.tint(0xff0000);
    dVisionFutureEnd.move(bs.timeline.height * 8, 0);

    dNow.add(container);
    components.push(dNow);

    dYear.add(container);
    components.push(dYear);
  };
  initContainer();

  let future;

  this.init = data => {
    future = data.future;
  };

  this.vision = n => {
    vision = n;
  };

  this.time = n => {
    time = n;
  };

  this.move = (x, y) => {
    container.position.set(x, y);
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
    let time = future.time(),
        vision = future.vision();

    dYear.setText(years[time]);

    let nowX = time * bs.timeline.height;
    dNow.move(nowX, 0);

    let yearBounds = dYear.bounds();
    dYear.move(nowX + 
               bs.timeline.height * 0.5 
               - yearBounds.width * 0.5 , 0);


    let lowerTime = Math.max(0, time - vision);

    let safeVisionPast = time - lowerTime;
    let visionPastW = safeVisionPast * bs.timeline.height;
    let visionPastX = nowX - visionPastW + bs.timeline.height * 0.5;
    dVisionPast.size(visionPastW, bs.timeline.height);
    dVisionPast.move(visionPastX, 0);

    let visionPastBeginVisible = lowerTime === 0;
    dVisionPastBegin.visible(visionPastBeginVisible);

    let upperTime = Math.min(8, time + vision);

    let safeVisionFuture = upperTime - time;
    let visionFutureW = safeVisionFuture * bs.timeline.height;
    let visionFutureX = nowX + bs.timeline.height * 0.5;
    dVisionFuture.size(visionFutureW, bs.timeline.height);
    dVisionFuture.move(visionFutureX, 0);

    let visionFutureEndVisible = upperTime === 8;
    dVisionFutureEnd.visible(visionFutureEndVisible);

    components.forEach(_ => _.render());
  };
}
