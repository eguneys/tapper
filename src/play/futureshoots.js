import { dContainer, asprite } from '../asprite';

export default function FutureShoots(play, ctx, bs) {

  const { textures } = ctx;

  let shootTextures = textures['mall']['items']['shoots'];

  let dBody = asprite(shootTextures, 200, false);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    container.addChild(dBody);
    dBody.width = bs.tileSize.width;
    dBody.height = bs.tileSize.height;
  };
  initContainer();

  let shoots;
  let future;
  this.init = data => {
    future = data.future;
  };

  const updateShoots = () => {
    if (shoots !== future.shoots()) {
      shoots = future.shoots();
      dBody.position.set(shoots.x * bs.tileSize.width,
                 shoots.y * bs.tileSize.height);
      dBody.play();
    }
  };

  this.update = delta => {
    updateShoots();
    components.forEach(_ => _.update(delta));
    dBody.update(delta);
  };


  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };
}
