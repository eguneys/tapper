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

  const actionReset = async () => {
    effectViewMenu();
    effectViewMenubar(false);
    effectViewGame('solitaire');
  };

  const effectViewMenubar = (visible) => {
    view.mutate(_ => {
      _.menubar = visible;
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
