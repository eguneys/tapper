import { objMap } from '../../util2';
import AContainer from '../acontainer';
import Fipps from '../fippstext';
import AVContainer from '../avcontainer';

import ASelectOption from '../aselectoption';

export default function SoliCardsPerDraw(play, ctx, bs) {

  let cardGame = play.cardGame;

  let h1Size = bs.height * 0.06;

  let dLabel = new Fipps(this, ctx, {
    label: "Cards Per Draw",
    size: h1Size,
  });

  const makeSelectOption = (key, name) => {
    const onCheck = () => {
      cardGame.userActionOptionSoliCardsPerDraw(key);
    };

    let ds = new ASelectOption(this, ctx, {
      width: bs.select.width,
      height: bs.select.height,
      label: name,
      onCheck
    });

    ds.container.moveX(bs.uiMargin * 2.0);

    let oObserve = cardGame
        .oOptions
        .solitaire
        .cardsPerDraw;

    oObserve.subscribe(_ => {
      let selected = _ === key;
      ds.dO.smoothcheck(selected);
    });

    return ds;
  };

  let dOptionsMap = {
    onecardnoreshuffle: '1 card no reshuffle',
    onecard: '1 card',
    threecards: '3 cards'
  };

  let dOptions = objMap(dOptionsMap,
                        (key, value) =>
                        makeSelectOption(key, value));

  let dVContainer = new AVContainer(this, ctx, {
    contents: [
      dLabel,
      ...Object.values(dOptions)
    ],
    gap: bs.uiMargin * 0.5
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dVContainer);

    dLabel.container.hcenter(bs.height);
  };
  initContainer();

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
