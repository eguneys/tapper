import { dContainer } from '../asprite';

import iPol from '../ipol';

import { tapHandler } from './util';

import FText from './ftext';

export default function CandyLabelText(play, ctx, bs) {

  const { events, textures } = ctx;

  let dLabel = new FText(this, ctx, {
    size: bs.size
  });

  let dText = new FText(this, ctx, {
    size: bs.size
  });

  let iTap = new iPol(0, 1, {yoyo: 1});

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dLabel.add(container);
    components.push(dLabel);

    dLabel.setText(bs.label);

    dText.add(container);
    components.push(dText);

    dText.move(0, bs.size + 4);
  };
  initContainer();

  this.init = data => {
    iTap.both(1, 0);

  };

  this.setText = text => {
    dText.setText(text);
  };

  const handleTap = tapHandler(() => {
    if (bs.onTap) {
      bs.onTap();
      iTap.both(0, 1);
    }
  }, events, () => this.bounds());

  this.update = delta => {
    iTap.update(delta / 100);
    handleTap(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    let vTap = iTap.value();

    let sExtend = 0.1 * vTap;
    container.scale.set(1-sExtend);

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
