import AContainer from './acontainer';

export default function AVContanier(play, ctx, bs) {

  let { contents, gap = 0 } = bs;

  let container = this.container = new AContainer();
  const initContainer = () => {
    
    let offsetY = 0;

    contents.forEach(_ => {
      container.addChild(_);
      _.container.moveY(offsetY);
      let bounds = _.container.bounds();
      offsetY += bounds.height + gap;
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
