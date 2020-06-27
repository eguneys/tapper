import { objForeach } from '../util2';
import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import AContainer from './acontainer';

import CardGame from '../cardgame';
import SolitaireAi from '../aisolitaire';

import CardGameHome from './cardgamehome';
import CardGameMenu from './cardgamemenu';
import CardGameBar from './cardgamebar';
import SolitaireView from './solitaire';

import SoliSideBar from './solisidebar';

import CardAiControl from './cardaicontrol';

export default function CardGameView(play, ctx, pbs) {

  let cardGame = this.cardGame = new CardGame();

  let bs = (() => {
    let { width, height } = pbs;

    let barWidth = width * 0.09,
        barHeight = height * 0.4,
        boundsMargin = width * 0.01;
    
    let bar = rect(width - barWidth, 
                   barHeight,
                   barWidth, 
                   height - barHeight - boundsMargin * 2.0);

    return {
      bar,
      width,
      height
    };
  })();

  let dBar = new CardGameBar(this, ctx, bs);

  let dPopupMenu = new CardGameMenu(this, ctx, bs);

  let dHome = new CardGameHome(this, ctx, bs);

  let dGameContainer = dContainer();

  let dSolitaire = new SolitaireView(this, ctx, bs);
  let dSoliSideBar = new SoliSideBar(dSolitaire, ctx, bs);

  const dViewMap = {
    'home': [dHome, null],
    'solitaire': [dSolitaire, dSoliSideBar],
    'spider': [dSolitaire, dSoliSideBar],
    'freecell': [dSolitaire, dSoliSideBar]
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.c.addChild(dGameContainer);
    
    container.addChild(dBar);

    container.addChild(dPopupMenu);
  };

  initContainer();

  let dLastView;

  let lastAi;

  cardGame.oView.subscribe(view => {
    let { home, game } = view;

    let dView;

    if (home) {
      dView = dViewMap['home'];
    } else {
      dView = dViewMap[game];
    }

    if (dLastView) {
      dLastView.forEach(_ => {
        if (!_) { return; };
        _.remove();
        container.removeChild(_, dGameContainer);
      });
    }
    dLastView = dView;

    dView.forEach(_ => {
      if (!_) return;
      container.addChild(_, dGameContainer);
      _.init();
    });
    let sideView = dView[1];
    if (sideView) {
      sideView.container.move(bs.bar.x, bs.bar.y);
    }
  });

  this.init = (data) => {
    let { optionsStore } = ctx;

    cardGame.init({
      options: optionsStore.getOptions()
    });

    bindOptionsHandlers(optionsStore, cardGame);
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function bindOptionsHandlers(optionsStore, cardGame) {
  
  objForeach
  (cardGame.oOptions.showTutorial, (key, o) => {
    o.subscribe(value => {
      optionsStore.setShowTutorial(key, value);
    });
  });

  cardGame
    .oOptions
    .solitaire
    .cardsPerDraw
    .subscribe(value => {
      optionsStore.setSolitaireCardsPerDraw(value);
    });
  
}
