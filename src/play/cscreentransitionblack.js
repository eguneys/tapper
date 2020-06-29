import iPol from '../ipol';

import AContainer from './acontainer';
import ASprite from './asprite';
import { round } from './math';
import { callMaybe } from './util';

export default function ScreenTransitionBlack(play, ctx, bs) {

  const { textures } = ctx;
  const mhud = textures['mhud'];

  let dBg = new ASprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: mhud['menubg']
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
  };
  initContainer();

  let iLife = 
      new iPol(0,
               0, 
               {});

  let iWaitBlack = new iPol(0, 0, {});
  

  let changingOnLap;
  const onFade = () => {
    if (changingOnLap) {
      changingOnLap();
    }
  };
  let fadingState = null;

  this.init = (data) => {
    fadingState = 'fading';
    changingOnLap = data;
    iLife.both(0, 1);
  };

  const updateFading = () => {
    if (fadingState === 'fading' &&
        iLife.settled()) {
      fadingState = 'black';
      iWaitBlack.both(0, 1);
      onFade();
    }
    if (fadingState === 'black' &&
        iWaitBlack.settled()) {
      fadingState = 'fadingOff';
      iLife.both(1, 0);
    }
  };

  this.update = delta => {
    iLife.update(delta / 500);
    iWaitBlack.update(delta / 300);
    updateFading();

    this.container.update(delta);
  };

  this.render = () => {
    let vLife = iLife.value();

    vLife = round(vLife, 0.2);
    dBg.alpha(vLife);

    this.container.render();
  };
}
