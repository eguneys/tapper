import iPol from '../ipol';
import AContainer from './acontainer';
import ASprite from './asprite';
import AVContainer from './avcontainer';
import Fipps from './fippstext';

import { callMaybe, tapHandler } from './util';

export default function CSidebar(play, ctx, bs) {

  let dNewgame = new CSideLabel(this, ctx, {
    content: new Fipps(this, ctx, {
      label: "New\nGame",
      size: bs.text.p * 0.5
    }),
    onTap() {
      callMaybe(bs.onNewgame);
    }
  });

  let dScoreLabel = new Fipps(this, ctx, {
    label: "Score\n0",
    size: bs.text.p * 0.5
  });

  let dScore = new CSideLabel(this, ctx, {
    content: dScoreLabel
  });

  let dUndoContent = new CUndo(this, ctx, {
    ...bs
  });

  let dUndo = new CSideLabel(this, ctx, {
    content: dUndoContent,
    onTap() {
      callMaybe(bs.onUndo);
    }
  });

  const setScore = score => {
    dScore.text(`Score\n${score}`);
  };

  let dSideContainer = new AVContainer(this, ctx, {
    contents: [dNewgame, dScore, dUndo],
    gap: bs.uiMargin,
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dSideContainer);
    dSideContainer.container.bottom(bs.height - bs.uiMargin);
    dScore.container.right(bs.width);
    dNewgame.container.right(bs.width);
    dUndo.container.right(bs.width);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function CSideLabel(play, ctx, bs) {

  const { events, textures } = ctx;
  const mhud = textures['mhud'];

  let { content } = bs;

  let cBounds = content.container.bounds();
  let bgBoundsW = cBounds.width * 1.3,
      bgBoundsH = cBounds.height * 1.3;

  let dBg = new ASprite(this, ctx, {
    width: bgBoundsW,
    height: bgBoundsH,
    texture: mhud['sidelabel']
  });

  let iTap = new iPol(0, 1, {yoyo: 1});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
    container.addChild(content);
    content.container.center(bgBoundsW * 1.1,
                             bgBoundsH);
  };
  initContainer();

  this.init = (data) => {
    
  };

  const handleTap = tapHandler(() => {
    callMaybe(bs.onTap);
    iTap.both(0, 1);
  }, events, () => container.bounds());

  this.update = delta => {
    handleTap(delta);
    iTap.update(delta / 100);
    this.container.update(delta);
  };

  this.render = () => {
    let vTap = iTap.value();

    let sExtend = 0.1 * vTap;
    container.scale(1-sExtend);

    this.container.render();
  };
}

function CUndo(play, ctx, bs) {

  const { textures } = ctx;
  const mhud = textures['mhud'];

  let dLabel = new Fipps(this, ctx, {
    label: "Undo",
    size: bs.text.p * 0.5
  });

  let dIcon = new ASprite(this, ctx, {
    width: bs.text.p,
    height: bs.text.p,
    texture: mhud['undo']
  });

  let dVContainer = new AVContainer(this, ctx, {
    contents: [dIcon, dLabel]
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dVContainer);
    dIcon.container.hcenter(dLabel.container.bounds().width);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
