import { rect } from '../dquad/geometry';

import AContainer from './acontainer';

import ALabelText from './alabeltext';
import AIconText from './aicontext';

export default function SoliSideBar(play, ctx, pbs) {

  let solitaire = play.gsolitaire;

  const { textures } = ctx;
  
  const mhud = textures['mhud'];

  let bs = (() => {
    let { width, height, bar } = pbs;

    let hudMargin = bar.width * 0.1;

    let vGap = hudMargin * 4.0;

    let iconWidth = bar.width,
        iconHeight = iconWidth;

    let newGame = rect(0,
                       hudMargin,
                       iconWidth * 0.2,
                       iconHeight * 0.2);

    let moves = rect(0,
                     newGame.y1 + vGap,
                     iconWidth * 0.2,
                     iconHeight * 0.2);

    let undo = rect(0,
                    bar.height - iconHeight,
                    iconWidth * 0.5,
                    iconHeight * 0.5);

    return {
      newGame,
      moves,
      undo,
      width,
      height
    };
  })();

  let dUndo = new AIconText(this, ctx, {
    text: 'UNDO',
    icon: mhud['undo'],
    size: bs.undo.height,
    vertical: true,
    onTap() {
      solitaire.userActionUndo();
    }
  });

  let dScoreLabel = new ALabelText(this, ctx, {
    size: bs.moves.height,
    label: 'SCORE'
  });

  let dNewGame = new ALabelText(this, ctx, {
    label: " NEW\nGAME",
    size: bs.newGame.height,
    onTap() {
      solitaire.userActionNewGame();
    }
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    dUndo.container.move(bs.undo.x, bs.undo.y);
    container.addChild(dUndo);

    dNewGame.container.move(bs.newGame.x, bs.newGame.y);
    container.addChild(dNewGame);

    dScoreLabel.container.move(bs.moves.x, bs.moves.y);
    container.addChild(dScoreLabel);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.remove = () => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
