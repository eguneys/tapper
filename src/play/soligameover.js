import AContainer from './acontainer';

import { Transitions } from './atransitioncontent';
import ATransitionContent from './atransitioncontent';
import CGameOver from './cgameover';

export default function SoliGameOver(play, ctx, bs) {

  let gsolitaire = play.gsolitaire;
  let cardGame = play.cardGame;

  let youFinished = `You finished Solitaire.`;

  let { optionsStore } = ctx;
  let dGameOver = new CGameOver(this, ctx, {
    content: youFinished,
    onNewGame() {
      let options = optionsStore.solitaire();
      gsolitaire.userActionNewGame(options);
    },
    onMainMenu() {
      cardGame.userActionSelectBack();
    },
    ...bs
  });

  let dGameOverTransition = new ATransitionContent(this, ctx, {
    content: dGameOver,
    transition: Transitions.Scale,
    ...bs
  });
  

  let container = this.container = new AContainer();
  const initContainer = () => {
    dGameOver.container.center(bs.width, bs.height);

    container.addChild(dGameOverTransition);
  };
  initContainer();

  const transition = on => {
    dGameOverTransition.transition(on);
  };

  gsolitaire.oGameOver.subscribe(_ => {
    if (_) {
      transition(true);
    }
  });

  gsolitaire.oGameReset.subscribe(_ => {
    transition(false);
  });

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
