import AContainer from './acontainer';

import CardGameView from './cardgame';

export default function Play(ctx) {

  const { canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    return {
      width,
      height
    };
  })();

  let dCardGame = new CardGameView(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dCardGame);
    
  };
  initContainer();

  this.init = (data) => {
    dCardGame.init();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
