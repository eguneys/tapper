import { dContainer } from '../asprite';

import FText from './ftext';

export default function CandyLabelText(play, ctx, bs) {

  let dLabel = new FText(this, ctx, {
    size: bs.size
  });

  let dText = new FText(this, ctx, {
    size: bs.size
  });

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
  };

  this.setText = text => {
    dText.setText(text);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
