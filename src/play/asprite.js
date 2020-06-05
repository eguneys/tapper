import AContainer from './acontainer';
import { sprite } from '../asprite';

export default function ASprite(play, ctx, bs) {

  let { x, y, width, height, texture } = bs;
  
  let dBody = sprite(texture);

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

  this.texture = texture => {
    dBody.texture = texture;
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
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
