import AContainer from './acontainer';

import iPol from '../ipol';

import ASprite from './asprite';
import AText from './atext';

import { tapHandler } from './util';


export default function AIconText(play, ctx, bs) {

  const { events } = ctx;

  let { vertical } = bs;

  let dIcon = new ASprite(this, ctx, {
    width: bs.size,
    height: bs.size,
    texture: bs.icon
  });

  let dText = new AText(this, ctx, {
    size: bs.size * 0.5
  });

  let iTap = new iPol(0, 1, {yoyo: 1});


  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dIcon);

    container.addChild(dText);
    dText.setText(bs.text);

    if (vertical) {
      dText.container.move(0, bs.size);
    } else {
      dText.container.move(bs.size, bs.size * 0.25);
    }
  };
  initContainer();

  this.init = (data) => {
    
  };

  const handleTap = tapHandler(() => {
    if (bs.onTap) {
      bs.onTap();
      iTap.both(0, 1);
    }
  }, events, () => container.bounds());

  this.update = delta => {
    handleTap(delta);
    iTap.update(delta / 100);
    this.container.update(delta);
  };

  this.render = () => {
    let vTap = iTap.value();

    let sExtend = 0.1 * vTap;
    container.scale(1-sExtend);

    this.container.render();
  };
}
