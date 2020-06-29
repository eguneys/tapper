import AContainer from './acontainer';

export default function Play(play, ctx, bs) {

  let container = this.container = new AContainer();
  const initContainer = () => {
    
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.remove = () => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
