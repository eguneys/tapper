import AContainer from './acontainer';
import AAnimated from './aanimated';

import { callMaybe, tapHandler } from './util';

export default function ACheckbox(play, ctx, bs) {

  const { textures } = ctx;
  const mhud = textures['mhud'],
        mcheckbox = mhud['checkbox'];
  

  let dOn = new AAnimated(this, ctx, {
    width: bs.width,
    height: bs.height,
    animations: {
      onoff: {
        textures: mcheckbox['onoff'],
        duration: 200
      }
    }
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dOn);
  };
  initContainer();

  this.smoothcheck = value => {
    dOn.smoothplay('onoff', value?0:1);
  };

  this.init = (data) => {
    
  };

  const { events } = ctx;

  const handleTap = tapHandler(() => {
    callMaybe(bs.onCheck);
  }, events, () => dOn.container.bounds());

  this.update = delta => {
    handleTap(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
