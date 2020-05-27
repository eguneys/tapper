import { dContainer } from '../asprite';

import iPol from '../ipol';
import { Easings } from '../ipol';

import TapSprite from './tapsprite';
import FText from './ftext';

import { callMaybe, tapHandler2 } from './util';

export default function CardMenuCard(play, ctx, bs) {

  const { events, textures } = ctx;

  let mcards = textures['mcards'];
  
  let { width, height } = bs;

  let iElevate = new iPol(0, 0, {});

  let dFrontContainer = dContainer();

  let dBg2 = new TapSprite(this, ctx, {
    width: width,
    height: height,
    texture: mcards['shadow']
  });

  let dBg = new TapSprite(this, ctx, {
    width: width,
    height: height,
    texture: mcards['front']
  });

  let dText = new FText(this, ctx, {
    size: height * 0.15
  });

  let dIcon = new TapSprite(this, ctx, {
    width: width * 0.8,
    height: width * 0.8,
    texture: bs.icon
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dBg2.add(container);
    components.push(dBg2);

    container.addChild(dFrontContainer);

    dBg.add(dFrontContainer);
    components.push(dBg);

    dIcon.move(width * 0.5 - width * 0.8 * 0.5,
               height - width * 0.9);
    dIcon.add(dFrontContainer);
    components.push(dIcon);

    dText.move(bs.width * 0.05,
               bs.height * 0.1);
    dText.add(dFrontContainer);
    components.push(dText);
    dText.setText(bs.text);
  };
  initContainer();

  this.init = data => {
  };

  const elevateBegin = () => {
    iElevate.value(iElevate.value());
    iElevate.target(1);
  };

  const elevateEnd = () => {
    iElevate.value(iElevate.value());
    iElevate.target(0);
  };

  const handleTap = tapHandler2({
    onBegin() {
      elevateBegin();
    },
    onUpdate() {
    },
    onEnd(tapped) {
      elevateEnd();
      if (tapped) {
        callMaybe(bs.onTap);
      }
    },
    boundsFn: () => this.bounds()
  }, events);

  this.update = delta => {
    iElevate.update(delta / 200);
    handleTap(delta);
    components.forEach(_ => _.update(delta));
  };

  let elevateW = width * 0.05,
      elevateH = height * 0.05;

  const renderElevation = () => {
    let vElevate = iElevate.easing(Easings.easeOutQuad);

    let eX = - elevateW * vElevate,
        eY = - elevateH * vElevate;

    dFrontContainer.position.set(eX, eY);

  };


  this.render = () => {
    renderElevation();
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
