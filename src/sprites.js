import * as PIXI from 'pixi.js';

export default function sprites(resources) {

  const json = name => resources[name].data;
  const texture = name => resources[name].texture;
  const ssTextures = name => resources[name].spritesheet.textures;

  const fT = atlas =>
        (x, y, w, h) => frameTexture(texture(atlas), x, y, w, h);

  const mall = fT('mall');
  const mhud = fT('mhud');
  const mtapper = fT('mtapper');

  const mcards = fT('mcards');

  return {
    'fletters': fletters(texture('fletters'), json('flettersjson')),
    'fkerning': json('flettersjson'),
    'pletters': fletters(texture('pletters'), json('plettersjson')),
    'pkerning': json('plettersjson'),
    'greenbg': texture('greenbg'),
    'mbg': texture('mbg'),
    'mall': all(mall),
    'mcards': cards(mcards),
    'mhud': hud(mhud)
  };
}

const hud = (mhud) => {
  return {
    'undo': mhud(0, 0, 32)
  };
};

const cards = (mcards) => {
  return {
    'front': mcards(0, 0, 64, 89),
    'spades': mcards(0, 96, 32),
    'hearts': mcards(0, 128, 32),
    'clubs': mcards(0, 160, 32),
    'diamonds': mcards(0, 192, 32),
    'back': mcards(0, 224, 64, 89),
    'highlight': mcards(0, 320, 64, 89)
  };
};

const all = (mall) => {
  return {
    'wood': mall(0, 0, 32),
    'gold': mall(0, 32, 32),
    'food': mall(0, 64, 32),
    'tilebg': mall(0, 96, 32),
    'tileselect': mall(32, 96, 32),
    'resourcebg3': slice3(mall, 0, 144, 16, 32)
  };
};

const slice3 = (mall, x, y, w, h) => {
  return [
    mall(x, y, w, h),
    mall(x + w, y, w, h),
    mall(x + w * 2, y, w, h)
  ];
};

const fletters = (texture, json) => {
  let mFrame = (x, y, w, h) => frameTexture(texture, x, y, w, h);

  let res = {};
  for (let letter in json) {
    let data = json[letter];
    res[letter] = mFrame(data.x, data.y, data.w, data.h);
  }
  return res;
};

const letters = (texture, x = 0, y = 0, size = 16) => {
  let mFrame = (x, y, w, h) => frameTexture(texture, x, y, w, h);

  let res = {};

  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((_, i) => 
    res[_] = mFrame(x + i * size, y, size, size));
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'].forEach((_, i) => 
    res[_] = mFrame(x + i * size, y + size, size, size));
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'].forEach((_, i) => 
    res[_] = mFrame(x + i * size, y + size * 2, size, size));
  ['V', 'W', 'X', 'Y', 'Z'].forEach((_, i) => 
    res[_] = mFrame(x + i * size, y + size * 3, size, size));

  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((_, i) => 
    res[_] = mFrame(x + i * size, y + size * 4, size, size));

  ['?', '.', '+', '-', '/', ',', ' '].forEach((_, i) =>
    res[_] = mFrame(x + (8 + i) * size, y, size, size));

  return res;
};

const slice9 = (texture, x, y, w, h) => {
  let mFrame = (x, y, w, h) => frameTexture(texture, x, y, w, h);

  return [
    mFrame(x, y, w, h),
    mFrame(x + w, y, w, h),
    mFrame(x + w * 2, y, w, h),
    mFrame(x, y + h, w, h),
    mFrame(x + w, y + h, w, h),
    mFrame(x + w * 2, y + h, w, h),
    mFrame(x, y + h * 2, w, h),
    mFrame(x + w, y + h * 2, w, h),
    mFrame(x + w * 2, y + h * 2, w, h)
  ];
};

const frameTexture = (texture, x, y, w, h = w) => {
  let rect = new PIXI.Rectangle(x, y, w, h);
  let t = new PIXI.Texture(texture);
  t.frame = rect;
  return t;
};

const animationTextures = (textures, rName, frames) => {
  let res = [];
  for (let i = 0; i < frames; i++) {
    let name = rName.replace('%', i);
    res.push(textures[name]);
  }
  return res;
};
