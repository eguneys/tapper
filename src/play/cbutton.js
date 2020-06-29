import iPol from '../ipol';
import AContainer from './acontainer';
import ASprite from './asprite';
import A9Slice from './a9slice';
import Fipps from './fippstext';

import { callMaybe, tapHandler } from './util';

export default function CButton(play, ctx, bs) {

  const { textures } = ctx;
  const mhud = textures['mhud'];

  let dLabel = new Fipps(this, ctx, {
    label: bs.label,
    size: bs.height * 0.3
  });

  let uiMargin = 8;
  let labelBounds = dLabel.container.bounds();

  let dBg = new A9Slice(this, ctx, {
    width: labelBounds.width + uiMargin * 2.0,
    height: bs.height,
    tileWidth: 16,
    textures: mhud['rbutton']
  });


  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
    container.addChild(dLabel);

    dLabel.container.center(labelBounds.width + uiMargin * 2.0,
                            bs.height);
  };
  initContainer();

  let iClick = new iPol(0, 0, { yoyo: 1 });

  this.init = (data) => {
    
  };

  const animateClick = () => {
    iClick.both(0, 1);
  };

  const { events } = ctx;
  const handleTap = tapHandler(() => {
    callMaybe(bs.onTap);
    animateClick();
  }, events, () => container.bounds());

  this.update = delta => {
    iClick.update(delta / 100);
    handleTap(delta);
    this.container.update(delta);
  };

  this.render = () => {
    let vClick = iClick.value();

    let sExtend = 0.05 * vClick;
    container.scale(1-sExtend);

    this.container.render();
  };
}
