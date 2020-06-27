import AContainer from './acontainer';

export default function AHContanier(play, ctx, bs) {

  let { contents, gap = 0 } = bs;

  let container = this.container = new AContainer();
  const initContainer = () => {
    
    let offsetX = 0;

    contents.forEach(_ => {
      container.addChild(_);

      _.container.moveX(offsetX);
      let bounds = _.container.bounds();
      offsetX += bounds.width + gap;
    });

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
