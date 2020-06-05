import AContainer from './acontainer';
import ASprite from './asprite';

import CardCard from './cardcard';
import CardPlaceholder from './cardplaceholder';

export default function SoliHoles(play, ctx, bs) {

  let dHoles = [
    new SoliHole(this, ctx, { n: 0, ...bs }),
    new SoliHole(this, ctx, { n: 1, ...bs }),
    new SoliHole(this, ctx, { n: 2, ...bs }),
    new SoliHole(this, ctx, { n: 3, ...bs })
  ];

  let container = this.container = new AContainer();
  const initContainer = () => {
    dHoles.forEach((dHole, i) => {
      dHole.container.move(0, i * bs.holes.height + bs.stackMargin * 2.0);
      container.addChild(dHole);
    });
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

function SoliHole(play, ctx, bs) {

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

    },
    onEndCard() {

    },
    ...bs
  });

  let dTop = new CardCard(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dPlaceholder);
    container.addChild(dTop);
    
    dHighlight.container.move(-1, -1);
    container.addChild(dHighlight);
    
    dTop.highlight(false);
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
