import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import SolitaireView from './solitaire';
import SpiderView from './spider';

import CardGameBar from './cardgamebar';

export default function CardGame(play, ctx, pbs) {

  let bs = (() => {
    let { width, height } = pbs;

    return {
      width,
      height
    };
  })();

  let dBar = new CardGameBar(this, ctx, bs);
  let dSolitaire = new SolitaireView(this, ctx, bs);
  let dSpider = new SpiderView(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dSolitaire.add(container);
    components.push(dSolitaire);

    dSpider.add(container);
    components.push(dSpider);

    dBar.add(container);
    components.push(dBar);

  };
  initContainer();

  this.init = data => {

    dSolitaire.init({});

    dSpider.init({});

  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
