import { dContainer, sprite } from '../asprite';

export default function TapSprite(play, ctx, bs) {

  let { x, y, width, height, texture } = bs;

  let dBody = sprite(texture);

  const setSize = () => {
    dBody.width = width;
    dBody.height = height;
  };

  const setPosition = () => {
    dBody.position.set(x, y);
  };

  const container = dContainer();
  const initContainer = () => {
    setPosition();
    setSize();
    container.addChild(dBody);
  };
  initContainer();

  let data;
  this.init = _data => {
    data = _data;
  };

  this.data = () => data;

  this.bounds = () => dBody.getBounds();

  this.move = (_x, _y) => {
    if (x !== _x || y !== _y) {
      x = _x;
      y = _y;
      setPosition();
    }
  };

  this.size = (w, h) => {
    if (width !== w || height !== h) {
      width = w;
      height = h;
      setSize();
    }
  };

  this.scale = (x, y) => {
    dBody.scale.set(x, y);
  };

  this.anchor = (anchor) => {
    dBody.anchor.set(anchor, anchor);
  };

  this.visible = (visible) => {
    dBody.visible = visible;
  };

  this.alpha = (alpha) => {
    dBody.alpha = alpha;
  };

  this.tint = tint => {
    dBody.tint = tint;
  };

  this.texture = (texture) => {
    dBody.texture = texture;
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
  };

  this.render = () => {
  };

}
