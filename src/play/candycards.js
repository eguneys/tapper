import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import FText from './ftext';

const ranks = {
  'ace': 'A',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
  'ten': '10',
  'jack': 'J',
  'queen': 'Q',
  'king': 'K'
};

export default function CandyCards(play, ctx, bs) {

  const { textures } = ctx;

  let mcards = textures['mcards'];
  
  let cWidth = bs.card.width,
      cHeight = bs.card.height,
      mWidth = cWidth * 0.8,
      mHeight = mWidth,
      tWidth = mWidth * 0.5,
      tHeight = tWidth;

  let tMargin = tWidth * 0.1;

  let dBg = new TapSprite(this, ctx, {
    width: cWidth,
    height: cHeight
  });

  let dMiddle = new TapSprite(this, ctx, {
    width: mWidth,
    height: mHeight
  });

  let dTop = new TapSprite(this, ctx, {
    width: tWidth,
    height: tHeight
  });

  let dRank = new FText(this, ctx, {
    size: tWidth,
  });

  let dHighlight = new TapSprite(this, ctx, {
    width: cWidth + 2,
    height: cHeight + 2,
    texture: mcards['highlight']
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);

    dTop.anchor(0.5);
    dTop.move(tWidth * 0.5 + tMargin, tHeight * 0.5 + tMargin);
    dTop.add(container);
    components.push(dTop);

    dMiddle.anchor(0.5);
    dMiddle.move(cWidth - mWidth * 0.5 - tMargin, cHeight - mHeight * 0.5 - tMargin);
    dMiddle.add(container);
    components.push(dMiddle);

    dRank.move(cWidth - tWidth - tMargin,  tMargin);
    dRank.add(container);
    components.push(dRank);

    dHighlight.move(-1, -1);
    dHighlight.add(container);
    components.push(dHighlight);
  };
  initContainer();

  let n;

  let highlight;

  this.init = data => {
    n = data.n;

    highlight = data.highlight;
    this.highlight(highlight);

    dBg.texture(data.back ? mcards.back : mcards.front);

    dMiddle.texture(mcards[data.suit]);
    dTop.texture(mcards[data.suit]);
    dTop.texture(mcards[data.suit]);

    dRank.setText(ranks[data.rank]);

    if (data.rank === 'ten') {
      dRank.move(cWidth - tWidth - tMargin * 4.0,  tMargin);
    } else {
      dRank.move(cWidth - tWidth - tMargin,  tMargin);
    }
  };

  this.highlight = (value) => {
    highlight = value;

    if (highlight) {
      dHighlight.visible(true);
    } else {
      dHighlight.visible(false);
    }
  };

  this.n = () => n;

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

  this.bounds = () => container.getBounds();

  this.globalPosition = () => container.getGlobalPosition();

  this.move = (x, y) => container.position.set(x, y);

  this.scale = (x, y) => container.scale.set(x, y);

  this.pivot = (x, y) => container.pivot.set(x, y);
}
