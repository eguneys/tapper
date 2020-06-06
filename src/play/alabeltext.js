import AContainer from './acontainer';

import iPol from '../ipol';

import { tapHandler } from './util';

import AText from './atext';

export default function Play(play, ctx, bs) {

  const { events, textures } = ctx;

  let dLabel = new AText(this, ctx, {
    size: bs.size
  });

  let dText = new AText(this, ctx, {
    size: bs.size
  });

  let iTap = new iPol(0, 1, {yoyo: 1});

  let container = this.container = new AContainer();
  const initContainer = () => {
    
    dLabel.setText(bs.label);
    container.addChild(dLabel);
    
    container.addChild(dText);

    dText.container.move(0, bs.size + 4);
  };
  initContainer();

  this.setText = dText.setText;

  this.init = (data) => {
    
  };

  const handleTap = tapHandler(() => {
    if (bs.onTap) {
      bs.onTap();
      iTap.both(0, 1);
    }
  }, events, () => container.bounds());

  this.update = delta => {
    iTap.update(delta / 100);
    handleTap(delta);
    this.container.update(delta);
  };

  this.render = () => {
    let vTap = iTap.value();

    let sExtend = 0.1 * vTap;
    container.scale(1-sExtend);

    this.container.render();
  };
}
