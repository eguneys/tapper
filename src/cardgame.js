import { pobservable, observable } from './observable';

export default function CardGame() {

  let view = this.view = observable({});

  let ai = this.ai = observable({});

  this.init = () => {
    actionReset();
  };

  this.userActionAiPlay = () => {
    effectAiPlayToggle();
  };

  this.userActionSelectGame = (game) => {
    effectViewGame(game);
  };

  this.userActionSelectBack = () => {
    effectViewMenu();
  };

  this.userActionSelectMenuBar = () => {
    
  };

  const actionReset = () => {
    effectViewMenu();
    effectViewGame('solitaire');
    effectAiPlayToggle();
    return Promise.resolve();
  };

  const effectAiPlayToggle = () => {
    ai.mutate(_ => {
      if (_.play === 'play') {
        _.play = 'pause';
      } else {
        _.play = 'play';
      }
    });
  };

  const effectViewGame = (game) => {
    view.mutate(_ => {
      _.menu = false;
      _.game = game;
    });
  };

  const effectViewMenu = () => {
    view.mutate(_ => {
      _.menu = true;
      _.game = false;
    });
  };

}
