import AContainer from './acontainer';
import ASprite from './asprite';

export default function CardBackground(play, ctx, bs) {

  const { textures } = ctx;

  let dBg = new ASprite(this, ctx, {
    width: bs.width,
    height: bs.height,
    texture: textures['greenbg']
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
