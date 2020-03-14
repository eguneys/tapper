export default function sprites(resources) {

  const ssTextures = name => resources[name].spritesheet.textures;

  return {
    'hud': ssTextures('hud')['Sprite-0001.'],
  };
}

const animationTextures = (textures, rName, frames) => {
  let res = [];
  for (let i = 0; i < frames; i++) {
    let name = rName.replace('%', i);
    res.push(textures[name]);
  }
  return res;
};
