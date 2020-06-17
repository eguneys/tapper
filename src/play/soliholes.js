import AContainer from './acontainer';
import ASprite from './asprite';

import CardCard from './cardcard';
import CardPlaceholder from './cardplaceholder';

import { isN } from '../soliutils';

export default function SoliHoles(play, ctx, bs) {

  this.rsolitaire = play.rsolitaire;
  this.solitaire = play.solitaire;

  let dHoles = [
    new SoliHole(this, ctx, { n: 0, ...bs }),
    new SoliHole(this, ctx, { n: 1, ...bs }),
    new SoliHole(this, ctx, { n: 2, ...bs }),
    new SoliHole(this, ctx, { n: 3, ...bs })
  ];

  this.dHoleN = n => dHoles[n];

  let container = this.container = new AContainer();
  const initContainer = () => {
    dHoles.forEach((dHole, i) => {
      dHole.container.move(0, i * bs.holes.height + bs.stackMargin * 2.0);
      container.addChild(dHole);
    });
  };
  initContainer();

  // const observePSelection = ({ 
  //   active,
  //   holeN }) => {
      
  //     if (!isN(holeN)) {
  //       return;
  //     }

  //     let dHole = this.dHoleN(holeN);

  //     if (active) {
  //       dHole.highlight(true);
  //     } else {
  //       dHole.highlight(false);
  //     }
  // };

  // this.solitaire.pSelection.subscribe(observePSelection);

  this.init = (data) => {
    dHoles.forEach(_ => _.init());
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  this.drags = dHoles.map(_ => _.drags)
    .reduce((acc, _) => acc.merge(_));
  this.drops = dHoles.map(_ => _.drops)
    .reduce((acc, _) => acc.merge(_));
}

function SoliHole(play, ctx, bs) {

  let rsolitaire = play.rsolitaire;
  let solitaire = play.solitaire;

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let { n } = bs;

  let cWidth = bs.card.width,
      cHeight = bs.card.height;

  let dHighlight = new ASprite(this, ctx, {
    width: cWidth + 2,
    height: cHeight + 2,
    texture: mcards['highlight']
  });

  let dPlaceholder = new CardPlaceholder(this, ctx, {
    onBeginCard(epos, decay) {
      solitaire.userActionSelectHole(n, epos, decay);
    },
    onEndCard() {
      solitaire.userActionEndSelectHole(n);
    },
    ...bs
  });

  let dTop = new CardCard(this, ctx, bs);

  this.nextCardGlobalPosition = () => {
    let { x, y } = dTop.container.globalPosition();
    return [x, y];
  };

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dPlaceholder);
    container.addChild(dTop);
    
    dHighlight.container.move(-1, -1);
    container.addChild(dHighlight);
    
    dTop.highlight(false);
  };
  initContainer();

  this.highlight = dTop.highlight;

  this.init = (data) => {
    listenSolitaire();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };

  const initHole = hole => {
    let top = hole.top();
    if (top) {
      dHighlight.visible(false);
      dTop.container.visible(true);
      dTop.init(top);
    } else {
      dHighlight.visible(true);
      dTop.container.visible(false);
    }
  };

  const listenSolitaire = () => {
    rsolitaire().pHoleN(n).onValue(hole => {
      initHole(hole);
    });
  };

  const insertN = _ => ({ ..._, holeN: n });
  this.drags = dPlaceholder.drags.map(insertN);
  this.drops = dPlaceholder.drops.map(insertN);

  // this.drags.log();
  // this.drops.log();
}
