import { objForeach } from './util2';
import { pobservable, observable } from './observable';
import { fId, fConstant, fNull, fToggle } from './futils';

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
    },
    spider: {
      nbSuits: observable(null)
    }
  };

  this.init = (data) => {
    actionReset();
    actionSetOptions(data.options);
  };

  this.userActionSelectGame = (game) => {
    actionGoGame(game);
  };

  this.userActionSelectBack = () => {
    actionGoHome();
  };

  this.userActionOptionShowTutorialCheck = key => {
    let option = oOptions.showTutorial[key];
    option.set(fToggle);
  };

  this.userActionOptionSoliCardsPerDraw = key => {
    oOptions.solitaire.cardsPerDraw.set(_ => key);
  };

  this.userActionOptionSpiderNbSuits = key => {
    oOptions.spider.nbSuits.set(_ => key);
  };

  this.userActionSelectMenuBar = () => {
    let open = oHamburger.apply(_ => _.open);
    effectHamburger(!open);
  };

  const actionSetOptions = (options) => {
    let { showTutorial,
          solitaire,
          spider
        } = options;

    objForeach(showTutorial, (key, value) => {
      oOptions.showTutorial[key].set(_ => value);
    });

    oOptions.solitaire
      .cardsPerDraw
      .set(_ => solitaire.cardsPerDraw);


    oOptions.spider
      .nbSuits
      .set(_ => spider.nbSuits);
  };

  const actionReset = async () => {
    effectViewHome();
    effectHamburger(false);

    // debug
    effectViewGame('spider');
  };

  const actionGoGame = async (game) => {
    effectViewGame(game);
  };

  const actionGoHome = async () => {
    effectViewHome();
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
