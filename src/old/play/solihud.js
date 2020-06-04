import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CandyIconText from './candyicontext';
import CandyLabelText from './candylabeltext';

export default function SoliHud(play, ctx, pbs) {

  const { textures } = ctx;
  
  const mhud = textures['mhud'];

  let bs = (() => {
    let { width, height } = pbs;

    let hudMargin = height * 0.1 / 4;
    let iconWidth = height * 0.1,
        iconHeight = iconWidth;

    let undo = rect(hudMargin, height - iconHeight - hudMargin, iconWidth, iconHeight);

    let moves = rect(width - hudMargin - pbs.card.width * 1.4,
                     hudMargin * iconHeight,
                     0, iconHeight);

    let newGame = rect(moves.x,
                       hudMargin,
                       0, iconHeight);

    return {
      newGame,
      moves,
      undo
    };
  })();


  let solitaire;

  const onUndoTap = () => {
    solitaire.undo();
  };

  const onNewGameTap = () => {
    solitaire.newGame();
  };

  let dUndo = new CandyIconText(this, ctx, {
    text: 'UNDO',
    icon: mhud['undo'],
    size: bs.undo.height,
    onTap: onUndoTap
  });

  let dMovesLabel = new CandyLabelText(this, ctx, {
    size: bs.undo.height * 0.4,
    label: 'MOVES'
  });

  let dNewGame = new CandyLabelText(this, ctx, {
    label: " NEW\nGAME",
    size: bs.undo.height * 0.4,
    onTap: onNewGameTap
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dNewGame.add(container);
    components.push(dNewGame);
    dNewGame.move(bs.newGame.x, bs.newGame.y);

    dMovesLabel.add(container);
    components.push(dMovesLabel);
    dMovesLabel.move(bs.moves.x, bs.moves.y);

    dUndo.add(container);
    components.push(dUndo);

    dUndo.move(bs.undo.x, bs.undo.y);
  };
  initContainer();

  this.init = data => {
    solitaire = data.solitaire;
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    let moves = solitaire.data.nbMoves;
    let undoUsed = solitaire.data.undoUsed;
    dMovesLabel.setText(moves + (undoUsed?"*":""));
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
