import { objForeach } from '../util2';
import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import AContainer from './acontainer';

import CardGame from '../cardgame';
import SolitaireAi from '../aisolitaire';

import CEmptyContainer from './cemptycontainer';

import CRouter from './crouter';
import CardGameHome from './cardgamehome';
import CardGameMenu from './cardgamemenu';
import CardGameBar from './cardgamebar';
import SolitaireView from './solitaire';
import SpiderView from './spider';

import SoliSideBar from './solisidebar';

import ATransitionContent from './atransitioncontent';
import { Transitions } from './atransitioncontent';

import CardAiControl from './cardaicontrol';

export default function CardGameView(play, ctx, pbs) {

  let cardGame = this.cardGame = new CardGame();

  let bs = (() => {
    let { width, height } = pbs;

    let stackMargin = Math.round(height * 0.04 / 
                                 4);
    let heightMargin = Math.round(height * 0.02 /
                                  4);

    let cRatio = 64 / 89;
    let cMargin = stackMargin * 0.1,
        cHeight = height / 4 - 
        heightMargin * 4.0,
        cWidth = cRatio * cHeight;
    cHeight = Math.floor(cHeight);
    cWidth = Math.floor(cWidth);
    let card = rect(0, 0, cWidth, cHeight);

    let barWidth = width * 0.09,
        barHeight = height * 0.4,
        boundsMargin = width * 0.01;
    
    let bar = rect(width - barWidth, 
                   barHeight,
                   barWidth, 
                   height - barHeight - boundsMargin * 2.0);

    let text = {
      p: width * 0.03,
      h1: width * 0.05,
    };

    return {
      text,
      card,
      bar,
      width,
      height
    };
  })();

  let dBar = new CardGameBar(this, ctx, bs);

  let dPopupMenu = new CardGameMenu(this, ctx, bs);

  let dPopupMenuTransition = new ATransitionContent(this, ctx, {
    transition: Transitions.SlideDown,
    content: dPopupMenu,
    ...bs
  });

  let dHome = new CardGameHome(this, ctx, bs);

  let dSolitaire = new SolitaireView(this,
                                     ctx,
                                     bs);
  let dSoliSideBar = new SoliSideBar(dSolitaire, 
                                     ctx,
                                     bs);

  let dSpider = new SpiderView(this,
                               ctx,
                               bs);

  let dEmptyContainer = new CEmptyContainer(this,
                                            ctx,
                                            bs);

  const routes = {
    'home': [dHome, dEmptyContainer],
    'solitaire': [dSolitaire, dSoliSideBar],
    'spider': [dSpider, dEmptyContainer],
    'freecell': [dSolitaire, dSoliSideBar]
  };

  let dRouter = new CRouter(this, ctx, {
    routes,
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dRouter);

    container.addChild(dBar);

    container.addChild(dPopupMenuTransition);
  };

  initContainer();

  cardGame.oView.subscribe(view => {
    let { home, game } = view;

    if (home) {
      dRouter.route('home');
    } else {
      dRouter.route(game);
    }
  });

  cardGame.oHamburger.subscribe(({ open }) => {
    dPopupMenuTransition.transition(open);
  });

  let { optionsStore } = ctx;

  this.init = (data) => {

    cardGame.init({
      options: optionsStore.getOptions()
    });
  };

  bindOptionsHandlers(optionsStore, cardGame);

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
