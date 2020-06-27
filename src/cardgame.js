import { objForeach } from './util2';
import { pobservable, observable } from './observable';

export default function CardGame() {

  let oView = this.oView = observable({});

  let oHamburger = this.oHamburger = observable({});

  let oOptions = this.oOptions = {
    showTutorial: {
      spider: observable(false),
      solitaire: observable(false),
      freecell: observable(false)
    },
    solitaire: {
      cardsPerDraw: observable(null)
    }
  };

  this.init = (data) => {
    actionReset();
    actionSetOptions(data.options);
  };

  this.userActionSelectGame = (game) => {
    effectViewGame(game);
  };

  this.userActionSelectBack = () => {
    effectViewHome();
  };

  const fId = _ => _;
  const fToggle = _ => !_;

  this.userActionOptionShowTutorialCheck = key => {
    let option = oOptions.showTutorial[key];
    option.set(fToggle);
  };

  this.userActionOptionSoliCardsPerDraw = key => {
    oOptions.solitaire.cardsPerDraw.set(_ => key);
  };

  this.userActionSelectMenuBar = () => {
    let open = oHamburger.apply(_ => _.open);
    effectHamburger(!open);
  };

  const actionSetOptions = (options) => {
    let { showTutorial,
          solitaire 
        } = options;

    objForeach(showTutorial, (key, value) => {
      oOptions.showTutorial[key].set(_ => value);
    });

    oOptions.solitaire
      .cardsPerDraw
      .set(_ => solitaire.cardsPerDraw);
  };

  const actionReset = async () => {
    effectViewHome();
    effectHamburger(true);
    effectViewGame('solitaire');
  };

  const effectHamburger = (open) => {
    oHamburger.mutate(_ => {
      _.open = open;
    });
  };

  const effectViewGame = (game) => {
    oView.mutate(_ => {
      _.home = false;
      _.game = game;
    });
  };

  const effectViewHome = () => {
    oView.mutate(_ => {
      _.home = true;
      _.game = false;
    });
  };

}
