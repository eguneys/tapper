import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import SolitaireView from './solitaire';
import SpiderView from './spider';

import CardGameMenu from './cardgamemenu';
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

  let dMenu = new CardGameMenu(this, ctx, bs);

  let dSolitaire = new SolitaireView(this, ctx, bs);
  let dSpider = new SpiderView(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dSolitaire.add(container);
    components.push(dSolitaire);

    dSpider.add(container);
    components.push(dSpider);

    dMenu.add(container);
    components.push(dMenu);

    dBar.add(container);
    components.push(dBar);

  };
  initContainer();

  this.init = data => {

    let gameName = 'solitaire';
    let names = {
      'spider': 'SPIDER',
      'solitaire': 'SOLI\nTAIRE',
      'freecell': 'FREE\nCELL'
    };

    dBar.setGame(names[gameName]);

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
