import Pool from 'poolf';
import AContainer from './acontainer';
import ASprite from './asprite';

export default function AText(play, ctx, bs) {

  const { textures } = ctx;

  let { texture = textures['fletters'], 
        kerning = textures['fkerning'] } = bs;

  let { size } = bs;

  let pool = new Pool(() => new ALetter(this, ctx, { size, texture, kerning }));

  let container = this.container = new AContainer();
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

    pool.each(_ => container.addChild(_));
  };

  const releaseSprites = () => {
    pool.each(_ => container.removeChild(_));
    pool.releaseAll();
  };

  let text;

  let x, y;

  this.init = (data) => {
    
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

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function ALetter(play, ctx, bs) {

  const { texture, kerning } = bs;

  let { size } = bs;

  let dBg = new ASprite(this, ctx, {});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
  };
  initContainer();

  let w, h;

  this.init = (data) => {
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

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
