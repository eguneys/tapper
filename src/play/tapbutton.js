import { dContainer } from '../asprite';
import { throttle } from '../util';
import { tapHandler } from './util';
import TapSprite from './tapsprite';

export default function TapButton(play, ctx, bs) {

  const { events } = ctx;

  let dBg = new TapSprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: bs.textures[0]
  });

  let bounds;

  const updateBounds = () => {
    bounds = container.getBounds();
  };

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);

    updateBounds();
  };
  initContainer();

  this.init = data => {
    dBg.init({});
  };

  this.move = (x, y) => {
    container.position.set(x, y);
    updateBounds();
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  const safeTap = throttle(() => {
    bs.onClick();
  }, 100);

  const handleTap = tapHandler(events, bounds, safeTap);

  this.update = delta => {
    handleTap();
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
