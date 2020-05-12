import { dContainer } from '../asprite';

import iPol from '../ipol';

import TapSprite from './tapsprite';
import FText from './ftext';

import { tapHandler } from './util';

export default function CandyIconText(play, ctx, bs) {

  const { events } = ctx;

  let dIcon = new TapSprite(this, ctx, {
    width: bs.size,
    height: bs.size,
    texture: bs.icon
  });

  let dText = new FText(this, ctx, {
    size: bs.size * 0.5
  });

  let iTap = new iPol(1, 0, {yoyo: 1});

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dIcon.add(container);
    components.push(dIcon);

    dText.add(container);
    components.push(dText);

    dText.setText(bs.text);

    dText.move(bs.size, bs.size * 0.25);
  };
  initContainer();

  this.init = data => {

    iTap.both(1, 0);

  };

  const handleTap = tapHandler(() => {
    if (bs.onTap) {
      bs.onTap();
      iTap.both(1, 0);
    }
  }, events, () => this.bounds());

  this.update = delta => {
    handleTap(delta);
    iTap.update(delta / 200);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {

    let vTap = iTap.value();

    let sExtend = 0.1 * vTap;
    container.scale.set(1+sExtend, 1+sExtend);

    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.bounds = () => container.getBounds();

  this.move = (x, y) => container.position.set(x, y);
}
