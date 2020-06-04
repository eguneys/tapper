import { rect } from '../dquad/geometry';

import AContainer from './acontainer';

import SolitaireView from './solitaire';

export default function Play(play, ctx, bs) {

  let dSolitaire = new SolitaireView(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dSolitaire);
  };
  initContainer();

  this.init = (data) => {
    dSolitaire.init();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
