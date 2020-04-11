import { dContainer, graphics } from '../asprite';
import ipol from '../ipol';

export default function TapScroll(play, ctx, bs) {

  const { events } = ctx;

  let bounds = {
    x: 0,
    y: 0,
    width: bs.width,
    height: bs.height
  };

  let scrollMask = graphics();

  const updateBounds = () => {
    scrollMask.clear();
    scrollMask.beginFill(0xff0000);
    scrollMask.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
  };


  let components = [];
  const container = dContainer();
  const initContainer = () => {
    updateBounds();
    container.mask = scrollMask;
  };
  initContainer();

  let scrollY,
      scrollYBuffer;

  let iScrollOffset = new ipol(0, 0, {});

  this.init = data => {
    scrollY = 0;
    scrollYBuffer = 0;
    iScrollOffset.both(0, 0);
  };

  this.move = (x, y) => {
    bounds.x = x;
    bounds.y = y;
    updateBounds();
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.addComponent = (comp) => {
    let cc = comp.add(container);
    components.push(comp);
  };

  const scroll = y => {
    scrollYBuffer = y;
  };

  const commitScroll = () => {
    scrollY += scrollYBuffer;
    scrollYBuffer = 0;
  };

  const handleSwipe = () => {
    const { current } = events.data;

    if (current) {
      let { ending, dpos } = current;

      scroll(dpos[1]);

      if (ending) {
        commitScroll();
      }

    }
  };

  const handleBounds = (delta) => {
    let vScrollOffset = iScrollOffset.value();
    iScrollOffset.update(delta * 0.1);

    if (!iScrollOffset.settled()) {
      scrollY = vScrollOffset;
    } else {

      if (scrollY > 1 && scrollYBuffer === 0) {
        iScrollOffset.both(scrollY, 0);
      }

      const cb = container.getBounds();

      if (cb.y === bounds.y) {
        let diff = bounds.height - cb.height;

        if (scrollY < 0 && scrollYBuffer === 0 && diff > 0) {
          iScrollOffset.both(scrollY, scrollY + diff);
        }
      }
    }
  };

  this.update = delta => {
    handleSwipe();
    handleBounds(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    container.position.set(0, scrollY + scrollYBuffer);

    components.forEach(_ => _.render());
  };

}
