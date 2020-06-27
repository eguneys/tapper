import AContainer from '../acontainer';
import Fipps from '../fippstext';
import ACheckOption from '../acheckoption';
import AVContainer from '../avcontainer';

export default function ShowTutorial(play, ctx, bs) {

  let cardGame = play.cardGame;

  let h1Size = bs.height * 0.06;

  let dLabel = new Fipps(this, ctx, {
    label: "Show Tutorial",
    size: h1Size,
    align: 'center'
  });

  const makeCheckOption = ({ key, name }) => {
    const onCheck = () => {
      cardGame.userActionOptionShowTutorialCheck(key);
    };
    
    let ds = new ACheckOption(this, ctx, {
      width: bs.checkbox.width,
      height: bs.checkbox.height,
      label: name,
      onCheck
    });

    ds.container.moveX(bs.uiMargin * 2.0);

    let oObserve = cardGame.oOptions.showTutorial[key];

    oObserve.subscribe(_ => ds.dO.smoothcheck(_));

    return ds;
  };

  let dOptions = [{
    key: 'solitaire',
    name: 'Solitaire'
  }, {
    key: 'spider',
    name: 'Spider'
  }, {
    key: 'freecell',
    name: 'Freecell'
  }].map(_ => makeCheckOption(_));

  let dHContainer = new AVContainer(this, ctx, {
    contents: [
      dLabel,
      ...dOptions
    ],
    gap: bs.uiMargin * 0.5
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    dLabel.container.moveX(bs.uiMargin);
    container.addChild(dHContainer);
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
