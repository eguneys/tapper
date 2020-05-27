import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CardGame from '../cardgame';

import SolitaireView from './solitaire';
import SpiderView from './spider';

import CardGameMenu from './cardgamemenu';
import CardGameBar from './cardgamebar';

export default function CardGameView(play, ctx, pbs) {

  let cardGame;

  let bs = (() => {
    let { width, height } = pbs;

    return {
      width,
      height
    };
  })();

  const onMenuTap = () => {
    console.log('menu');
  };

  const onBackTap = () => {
    cardGame.view('menu');
  };

  let dBar = new CardGameBar(this, ctx, {
    onMenuTap,
    onBackTap,
    ...bs
  });

  let dMenu = new CardGameMenu(this, ctx, bs);
  let dSolitaire = new SolitaireView(this, ctx, bs);
  let dSpider = new SpiderView(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const addComponent = (component) => {
    components.push(component);
  };
  const removeComponent = (component) => {
    components.splice(components.indexOf(component), 1);
  };
  const initContainer = () => {

    dMenu.add(container);
    dMenu.visible(false);

    dSolitaire.add(container);
    dSolitaire.visible(false);

    dSpider.add(container);
    dSpider.visible(false);

    dBar.add(container);
    components.push(dBar);
  };
  initContainer();

  let dViews = {
    'menu': dMenu,
    'solitaire': dSolitaire,
    'spider': dSpider
  };

  let lastView;

  this.init = data => {

    cardGame = new CardGame();

  };

  const setView = (view) => {
    if (lastView) {
      let dLastView = dViews[lastView];
      dLastView.visible(false);
      removeComponent(dLastView);
    }
    lastView = view;

    let dView = dViews[view];
    addComponent(dView);
    dView.visible(true);
    dView.init({
      cardGame
    });

    let gameName = view;
    let names = {
      'spider': 'SPIDER',
      'solitaire': 'SOLI\nTAIRE',
      'freecell': 'FREE\nCELL'
    };

    dBar.setGame(names[gameName]);
  };

  const refreshView = () => {
    let view = cardGame.data.view;

    if (view !== lastView) {
      setView(view);
    }
  };

  this.update = delta => {
    refreshView();
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
