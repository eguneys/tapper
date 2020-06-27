import { objMap } from '../util2';
import iPol from '../ipol';

import AContainer from './acontainer';
import { sprite } from '../asprite';

export default function AAnimated(play, ctx, bs) {

  let { x, y, width, height, 
        animations } = bs;
  
  let animators = objMap(animations, 
                         (key, animation) => 
                         new Animationer(animation));

  let currentAnimation = Object.keys(animations)[0];

  const currentAnimator = () => animators[currentAnimation];

  this.play = (animation) => {
    currentAnimation = animation;
    currentAnimator().reset();
  };

  this.smoothplay = (animation, direction) => {
    currentAnimation = animation;
    currentAnimator().smoothplay(direction);
  };

  let dBody = sprite();

  const setPosition = () => {
    dBody.position.set(x, y);
  };

  const setSize = () => {
    dBody.width = width;
    dBody.height = height;
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.c.addChild(dBody);
    setSize();
    setPosition();
  };
  initContainer();

  let data;

  this.init = (_data) => {
    data = _data;
  };

  this.data = () => data;

  this.alpha = alpha => {
    dBody.alpha = alpha;
  };

  this.anchor = (x) => {
    dBody.anchor.set(x, x);
  };

  this.visible = (visible) => {
    dBody.visible = visible;
  };

  this.size = (w, h) => {
    if (width === w && height === h) {
      return;
    }

    width = w;
    height = h;
    setSize();
  };

  this.move = (_x, _y) => {
    if (x === _x && y === _y) {
      return;
    }

    x = _x;
    y = _y;
    setPosition();
  };

  this.scale = (x, y) => {
    container.c.scale.set(x, y);
  };

  this.update = delta => {
    currentAnimator().update(delta);
    this.container.update(delta);
  };

  this.render = () => {
    let texture = currentAnimator().texture();
    dBody.texture = texture;
    this.container.render();
  };
}

function Animationer({ textures, 
                       duration,
                       loop }) {

  let lastTextureI = textures.length - 1;

  let iFrame = new iPol(0, lastTextureI, { yoyo: loop });

  this.texture = () => {

    let vFrame = iFrame.value();

    let frame = Math.floor(vFrame);

    return textures[frame];
  };

  this.smoothplay = (direction) => {
    if (direction === 0) {
      iFrame.value(iFrame.value());
      iFrame.target(lastTextureI);
    } else {
      iFrame.value(iFrame.value());
      iFrame.target(0);
    }
  };

  this.reset = () => {
    iFrame.both(0, lastTextureI);
  };
  
  this.update = (delta) => {
    iFrame.update(delta / duration);
  };

}
