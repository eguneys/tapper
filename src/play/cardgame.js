import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import AContainer from './acontainer';

import CardGame from '../cardgame';
import SolitaireAi from '../aisolitaire';

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

  let dAiControl = new CardAiControl(this, ctx, bs);

  let dGameContainer = dContainer();

  let dSolitaire = new SolitaireView(this, ctx, bs);
  let dSoliSideBar = new SoliSideBar(dSolitaire, ctx, bs);

  let aiSolitaire = new SolitaireAi(cardGame, dSolitaire.solitaire);

  const aiMap = {
    'solitaire': aiSolitaire,
    'spider': aiSolitaire,
    'freecell': aiSolitaire
  };

  const dViewMap = {
    'menu': [dMenu, null],
    'solitaire': [dSolitaire, dSoliSideBar],
    'spider': [dSolitaire, dSoliSideBar],
    'freecell': [dSolitaire, dSoliSideBar]
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.c.addChild(dGameContainer);
    
    container.addChild(dBar);

    container.addChild(dAiControl);
    dAiControl.container.move(bs.bar.x, bs.bar.y + 150);
  };

  initContainer();

  let dLastView;

  let lastAi;

  cardGame.view.subscribe(view => {
    let { menu, game } = view;

    let dView;

    if (menu) {
      dView = dViewMap['menu'];
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

    if (lastAi) {
      lastAi.userActionStop();
    }

    if (!menu) {
      let ai = aiMap[game];

      ai.userActionStart();
      lastAi = ai;
    } else {
      lastAi = undefined;
    }
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
