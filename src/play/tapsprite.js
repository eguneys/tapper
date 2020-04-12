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

  this.init = data => {
  };

  this.move = (_x, _y) => {
    x = _x;
    y = _y;
    setPosition();
  };

  this.size = (w, h) => {
    width = w;
    height = h;
    setSize();
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
