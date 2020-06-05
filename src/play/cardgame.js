import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import AContainer from './acontainer';

import CardGame from '../cardgame';

import CardGameMenu from './cardgamemenu';
import CardGameBar from './cardgamebar';
import SolitaireView from './solitaire';

export default function CardGameView(play, ctx, pbs) {

  let cardGame = this.cardGame = new CardGame();

  let bs = (() => {
    let { width, height } = pbs;

    return {
      width,
      height
    };
  })();

  let dBar = new CardGameBar(this, ctx, {
    onMenuTap() {
      cardGame.userActionSelectMenuBar();
    },
    onBackTap() {
      cardGame.userActionSelectBack();
    },
    ...bs
  });

  let dMenu = new CardGameMenu(this, ctx, bs);

  let dGameContainer = dContainer();
  let dSolitaire = new SolitaireView(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.c.addChild(dGameContainer);
    
    container.addChild(dBar);
  };
  initContainer();

  let dLastView;

  cardGame.view.subscribe(view => {
    let { menu, game } = view;

    let dView;

    if (menu) {
      dView = dMenu;
    } else {
      dView = dSolitaire;
    }

    if (dLastView) {
      dLastView.remove();
      container.removeChild(dLastView, dGameContainer);
    }
    dLastView = dView;

    container.addChild(dView, dGameContainer);

    dView.init();
  });

  this.init = (data) => {
    cardGame.init();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
