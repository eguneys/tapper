import { dContainer } from '../asprite';

import FText from './ftext';
import Tap3 from './tap3';
import ipol from '../ipol';

export default function FutureMessage(play, ctx, bs) {

  const { textures } = ctx;

  let dBg = new Tap3(this, ctx, {
    textures: textures['mall']['messageBar']
  });

  let dText = new FText(this, ctx, {
    size: bs.height * 0.08
  });

  let iAlpha = new ipol(1,1,{});

  let iShow = new ipol(0, 0, {});

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);

    dText.add(container);
    components.push(dText);
  };
  initContainer();

  let message;
  let future;
  this.init = data => {
    future = data.future;
    iAlpha.both(1);
    iShow.both(0);
  };

  this.setText = (text) => {
    iShow.both(0, 1);
    iAlpha.both(0, 1);
    dText.setText(text);
    dText.render();
    let textBounds = dText.bounds();
    setBgSize(textBounds.width, textBounds.height);
  };

  const setBgSize = (width, height) => {
    let x = (bs.width - width) * 0.5, 
        y = bs.height * 0.2;

    let margin = bs.width * 0.02;

    dText.move(x, y);
    dBg.move(x - margin, y - margin);
    dBg.size(width + margin * 2.0, bs.height, height + margin * 2.0);
  };

  const updateText = () => {
    let newMessage = future.message();
    if (!newMessage) {
      return;
    }
    if (message !== newMessage.text) {
      message = newMessage.text;
      if (message) {
        this.setText(message);
      }
    }
  };

  const updateShow = () => {
    if (message && iShow.settled()) {
      iAlpha.both(1, 0);
      message = undefined;
    }
  };

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    iAlpha.update(delta * 0.1);
    iShow.update((delta * 0.1) / 10);
    updateText();
    updateShow();
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    let vAlpha = iAlpha.value();
    container.alpha = vAlpha;
    components.forEach(_ => _.render());
  };
}
