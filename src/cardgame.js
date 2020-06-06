import { pobservable, observable } from './observable';

export default function CardGame() {

  let view = this.view = observable({});

  this.init = () => {
    actionReset();
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
    return Promise.resolve();
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
