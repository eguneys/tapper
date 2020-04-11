import Pool from 'poolf';
import { dContainer } from '../asprite';
import TapSprite from './tapsprite';

export default function TapText(play, ctx, bs) {

  let { size } = bs;

  let pool = new Pool(() => new TapLetter(this, ctx, { size }));

  const container = dContainer();
  const initContainer = () => {

  };
  initContainer();

  const addSprites = (text) => {
    let x = 0,
        y = 0;

    for (let i = 0; i < text.length; i++) {
      let letter = text[i];

      pool.acquire(_ => {
        _.init({ x, y, letter });
      });
      x += size;
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
    x = 0;
    y = 0;
  };

  this.setText = _text => {
    if (text === _text) return;

    text = _text;
    releaseSprites();
    addSprites(text);
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

  const { textures } = ctx;

  let { size } = bs;

  let dBg = new TapSprite(this, ctx, {
    x: 0, y: 0, 
    width: size,
    height: size
  });

  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
  };
  initContainer();


  this.init = data => {
    let x = data.x,
        y = data.y,
        letter = data.letter;

    let texture = textures['letters'][letter];

    texture = texture || textures['letters']['?'];

    dBg.position(x, y);
    dBg.texture(texture);
  };

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
