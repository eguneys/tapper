import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CandyIconText from './candyicontext';
import CandyLabelText from './candylabeltext';

export default function SpiderBar(play, ctx, pbs) {

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
                    bar.height - iconHeight - vGap,
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

  let dUndo = new CandyIconText(this, ctx, {
    text: 'UNDO',
    icon: mhud['undo'],
    size: bs.undo.height,
    vertical: true
  });

  let dMovesLabel = new CandyLabelText(this, ctx, {
    size: bs.moves.height,
    label: 'SCORE'
  });

  let dNewGame = new CandyLabelText(this, ctx, {
    label: " NEW\nGAME",
    size: bs.newGame.height
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {

    dUndo.move(bs.undo.x, bs.undo.y);
    dUndo.add(container);
    components.push(dUndo);

    dNewGame.move(bs.newGame.x, bs.newGame.y);
    dNewGame.add(container);
    components.push(dNewGame);

    dMovesLabel.add(container);
    components.push(dMovesLabel);
    dMovesLabel.move(bs.moves.x, bs.moves.y);
  };
  initContainer();

  this.init = data => {
    refresh();
  };

  const refresh = () => {
    let score = '12340';

    dMovesLabel.setText(score);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
