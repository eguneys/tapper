import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CandyIconText from './candyicontext';

export default function SoliHud(play, ctx, pbs) {

  const { textures } = ctx;
  
  const mhud = textures['mhud'];

  let bs = (() => {
    let { width, height } = pbs;

    let hudMargin = 8;
    let iconWidth = 32,
        iconHeight = 32;

    let undo = rect(hudMargin, height - iconHeight - hudMargin, iconWidth, iconHeight);

    return {
      undo
    };
  })();


  const onUndoTap = () => {
    console.log('here');
  };

  let dUndo = new CandyIconText(this, ctx, {
    text: 'UNDO',
    icon: mhud['undo'],
    size: bs.undo.height,
    onTap: onUndoTap
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dUndo.add(container);
    components.push(dUndo);

    dUndo.move(bs.undo.x, bs.undo.y);
  };
  initContainer();

  this.init = data => {
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
