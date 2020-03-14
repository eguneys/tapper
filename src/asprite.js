import * as PIXI from 'pixi.js';

export function graphics() {
  return new PIXI.Graphics();
}

export function dContainer() {
  return new PIXI.Container();
}

export function sprite(texture) {
  return new PIXI.Sprite(texture);
}

export function tsprite(texture, width, height) {
  return new PIXI.TilingSprite(texture, width, height);
}

export function pContainer() {
  return new PIXI.ParticleContainer();
}

export function nineSlice(texture, left, top = left, right = left, bottom = top) {
  return new PIXI.NineSlicePlane(texture, left, top, right, bottom);
}

export function text(txt, opts) {
  return new PIXI.Text(txt, opts);
}

export function asprite(textures, duration) {
  return new AnimatedSprite(textures, duration);
}

class AnimatedSprite extends PIXI.Sprite {
  constructor(textures, duration = 1000, loop = true) {
    super(textures[0]);

    this.loop = loop;
    this._textures = textures;
    this.duration = duration;
    this.lastTime = Date.now();
  }

  update() {
    let now = Date.now(),
        lastTime = this.lastTime,
        elapsed = (now - lastTime) / this.duration;

    if (elapsed >= 1) {
      if (this.loop) {
        this.lastTime = now;
      }
      elapsed = 0.9;
    }
    this.frame = Math.floor(elapsed * this._textures.length);
    this.texture = this._textures[this.frame];
  }
}
