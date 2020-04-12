import Pool from 'poolf';
import { dContainer } from '../asprite';
import TapSprite from './tapsprite';

export default function FText(play, ctx, bs) {

  let { texture, kerning } = bs;

  let { size } = bs;

  let pool = new Pool(() => new TapLetter(this, ctx, { size, texture, kerning }));

  const container = dContainer();
  const initContainer = () => {

  };
  initContainer();

  const addSprites = (text) => {
    let x = 0,
        y = 0;


    let lastSize;

    for (let i = 0; i < text.length; i++) {
      let letter = text[i];

      if (letter === '\n') {
        x = 0;
        y += lastSize?lastSize.h:0;
        continue;
      }

      pool.acquire(_ => {
        _.init({ x, y, letter });
        lastSize = _.getSize();
      });
      x += lastSize.w;
    }

    pool.each(_ => _.add(container));
  };

  const releaseSprites = () => {
    pool.each(_ => _.remove());
    pool.releaseAll();
  };

  let text;

  let x, y;

  this.init = data => {
  };

  this.setText = _text => {
    if (text === _text) return;

    text = _text;
    releaseSprites();
    addSprites(text);
  };

  this.bounds = () => {
    return container.getBounds();
  };

  this.move = (_x, _y) => {
    x = _x;
    y = _y;
  };

  this.add = (parent) => {
    parent.addChild(container);
    return container;
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    pool.each(_ => _.update(delta));
  };

  this.render = () => {
    container.position.set(x, y);
    pool.each(_ => _.render());
  };
}

function TapLetter(play, ctx, bs) {

  const { texture, kerning } = bs;

  let { size } = bs;

  let dBg = new TapSprite(this, ctx, {});

  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
  };
  initContainer();


  let w, h;

  this.init = data => {
    let x = data.x,
        y = data.y,
        letter = data.letter;

    let textureLetter = texture[letter] || texture['?'];

    let kerningLetter = kerning[letter] || kerning['?'],
        kW = kerningLetter.w,
        kH = kerningLetter.h;

    w = size * (kW / kH),
    h = size;

    dBg.size(w, h);
    dBg.move(x, y);
    dBg.texture(textureLetter);
  };

  this.getSize = () => ({
    w, h
  });

  this.add = (parent) => {
    parent.addChild(container);
    return container;
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    dBg.update(delta);
  };

  this.render = () => {
    dBg.render();
  };

}
