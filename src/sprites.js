import * as PIXI from 'pixi.js';

export default function sprites(resources) {

  const json = name => resources[name].data;
  const texture = name => resources[name].texture;
  const ssTextures = name => resources[name].spritesheet.textures;

  const fT = atlas =>
        (x, y, w, h) => frameTexture(texture(atlas), x, y, w, h);

  const mall = fT('mall');

  return {
    'fletters': fletters(texture('fletters'), json('flettersjson')),
    'fkerning': json('flettersjson'),
    'mall': all(mall),
  };
}

const all = (mall) => {
  return {
    'timeline1': mall(0, 0, 16),
    'timeline2': mall(16, 0, 16),
    'timeline3': mall(32, 0, 16),
    'timelineNow': mall(16 * 3, 0, 16),
    'rooms': {
      'room4': room(mall, 0, 48)
    }
  };
};

const room = (mall, x, y) => {
  return {
    'topleft': mall(x + 0, y + 0, 16),
    'top': mall(x + 16, y + 0, 16),
    'topright': mall(x + 32, y + 0, 16),
    'left': mall(x + 0, y + 16, 16),
    'floor': mall(x + 16, y + 16, 16),
    'right': mall(x + 32, y + 16, 16),
    'leftdoor': mall(x + 0, y + 32, 16),
    'rightdoor': mall(x + 32, y + 32, 16),
    'bottomleft': mall(x + 0, y + 48, 16),
    'bottom': mall(x + 16, y + 48, 16),
    'bottomright': mall(x + 32, y + 48, 16)
  };
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
