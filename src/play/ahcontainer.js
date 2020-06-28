import AContainer from './acontainer';

export default function AHContanier(play, ctx, bs) {

  let { contents = [], gap = 0 } = bs;

  const placeContents = () => {
    let offsetX = 0;

    contents.forEach(_ => {
      container.addChild(_);

      _.container.moveX(offsetX);
      let bounds = _.container.bounds();
      offsetX += bounds.width + gap;
    });
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    placeContents();
  };
  initContainer();

  this.contents = (_contents) => {

    contents
      .forEach(_ =>
        container.removeChild(_));
    
    contents = _contents;
    placeContents();
  };

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
