import AContainer from './acontainer';
import AHContainer from './ahcontainer';
import ASprite from './asprite';
import Fipps from './fippstext';

import { callMaybe, tapHandler } from './util';

export default function AChangingButtons(play, ctx, bs) {

  const fCallMaybe = fn => () => callMaybe(fn);

  let dClose = new AButton(this, ctx, {
    label: 'Close',
    width: bs.width * 0.2,
    height: bs.height,
    onTap: fCallMaybe(bs.onClose)
  });

  let dNext = new AButton(this, ctx, {
    label: 'Next',
    width: bs.width * 0.2,
    height: bs.height,
    onTap: fCallMaybe(bs.onNext)
  });

  let dBack = new AButton(this, ctx, {
    label: 'Back',
    width: bs.width * 0.2,
    height: bs.height,
    onTap: fCallMaybe(bs.onBack)
  });

  let dPlay = new AButton(this, ctx, {
    label: 'Play',
    width: bs.width * 0.2,
    height: bs.height,
    onTap: fCallMaybe(bs.onClose)
  });

  let dHContainerLeft = new AHContainer(this, ctx, {
  });

  let dHContainer = new AHContainer(this, ctx, {
    gap: bs.width * 0.02
  });

  const placeButtons = (buttons) => {
    let { close, next, back, play } = buttons;

    dHContainerLeft.contents(close?[dClose]:[]);

    let res = [];
    if (back) {
      res.push(dBack);
    }
    if (next) {
      res.push(dNext);
    }
    if (play) {
      res.push(dPlay);
    }
    dHContainer.contents(res);
    dHContainer.container.right(bs.width);
  };

  this.placeButtons = placeButtons;

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dHContainerLeft);

    container.addChild(dHContainer);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function AButton(play, ctx, bs) {

  const { textures } = ctx;
  const mhud = textures['mhud'];

  let dBg = new ASprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: mhud['wbutton']
  });

  let dLabel = new Fipps(this, ctx, {
    label: bs.label,
    size: bs.height * 0.5,
    fontFamily: 'Roboto',
    fill: 0xffffff,
    align: 'center'
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
    container.addChild(dLabel);
    dLabel.container.center(bs.width, bs.height);
  };
  initContainer();

  this.init = (data) => {
    
  };

  const { events } = ctx;

  const handleTap = tapHandler(() => {
    callMaybe(bs.onTap);
  }, events, () => container.bounds());

  this.update = delta => {
    handleTap(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
