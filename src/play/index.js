import { dContainer, sprite } from '../asprite';

export default function Play(ctx) {

  const { textures } = ctx;

  this.init = data => {
    initContainer();
  };

  this.update = delta => {
  };

  const initContainer = () => {
    const hello = sprite(textures['hud']);
    container.addChild(hello);
  };

  const container = this.container = dContainer();

  this.render = () => {
  };

}
