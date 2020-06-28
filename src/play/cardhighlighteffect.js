import AContainer from './acontainer';
import ASprite from './asprite';

import { Easings } from '../ipol';
import iPol from '../ipol';

export default function Play(play, ctx, bs) {

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let dHighlight = new ASprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: mcards['highlight']
  });

  let iEffect = new iPol(1, 1, {});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dHighlight);
  };
  initContainer();

  this.init = (data) => {
    iEffect.both(0, 1);
  };

  this.update = delta => {
    iEffect.update(delta / 500);
    this.container.update(delta);
  };

  let offsetX = bs.width * 0.25;

  this.render = () => {
    let vEffect = iEffect.easing(Easings.easeInQuad);

    let offset = offsetX * vEffect;
    
    dHighlight.move(-offset, -offset);
    dHighlight.size(bs.width + offset * 2.0,
                    bs.height + offset * 2.0);

    dHighlight.alpha(1.0 - vEffect);

    this.container.render();
  };
}
