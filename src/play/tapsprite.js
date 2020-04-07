import { dContainer, sprite } from '../asprite';

export default function TapSprite(play, ctx, bs) {

  let { x, y, width, height, texture } = bs;

  let dBody = sprite(texture);

  const setSize = () => {
    dBody.width = width;
    dBody.height = height;
  };

  const container = dContainer();
  const initContainer = () => {
    setSize();
    container.addChild(dBody);
  };
  initContainer();

  this.init = data => {
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
    dBody.position.set(x, y);
  };

}
