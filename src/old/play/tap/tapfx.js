import Pool from 'poolf';
import { dContainer } from '../asprite';
import ipol from '../ipol';

import TapSprite from './tapsprite';
import FText from './ftext';

export default function TapFx(play, ctx, bs) {

  let pTap = new Pool(() => new TapDelta(this, ctx, bs));

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  let tapper;
  this.init = data => {
    tapper = data.tapper;
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.releaseTap = (_) => {
    _.remove();
    components.splice(components.indexOf(_), 1);
    pTap.release(_);
  };


  this.update = delta => {
    let deltaTaps = tapper.deltaTaps();

    for (let tap of deltaTaps) {
      pTap.acquire(_ => {
        _.init(tap);
        _.add(container);
        components.push(_);
      });
    }

    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}

function TapDelta(play, ctx, bs) {

  let dDelta = new FText(this, ctx, {
    size: bs.taps.height
  });

  let yOffset = bs.taps.height * 2;
  let iLife = new ipol(0, 1, {});

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dDelta.add(container);
    components.push(dDelta);
  };
  initContainer();

  const deltaText = (delta) => {
    if (delta > 0) {
      return "+" + delta;
    } else {
      return "" + delta;
    }
  };

  let tap;
  this.init = data => {
    tap = data;

    iLife.both(0, 1);

    dDelta.init({});
    dDelta.setText(deltaText(tap.delta));
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  const updateLife = (delta) => {
    iLife.update(16 / delta * 0.001);

    if (iLife.settled()) {
      play.releaseTap(this);
    }
  };


  this.update = delta => {
    updateLife(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    let vLife = iLife.value();
    let x = tap.x,
        y = tap.y + -1 * tap.delta * vLife * yOffset;
    let aLife = vLife > 0.4 ? vLife:0.0;
    let alpha = 0.2 + (1.0 - (aLife * aLife)) * 0.8;

    dDelta.alpha(alpha);
    dDelta.move(x, y);
    components.forEach(_ => _.render());
  };

}
