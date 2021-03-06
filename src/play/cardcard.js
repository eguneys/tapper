import { dContainer } from '../asprite';
import AContainer from './acontainer';
import ASprite from './asprite';
import AText from './atext';

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

export default function CardCard(play, ctx, bs) {

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let cWidth = bs.card.width,
      cHeight = bs.card.height,
      mWidth = cWidth * 0.8,
      mHeight = mWidth,
      tWidth = mWidth * 0.5,
      tHeight = tWidth;

  let tMargin = tWidth * 0.1;

  let dBg = new ASprite(this, ctx, {
    width: cWidth,
    height: cHeight
  });

  let dFrontContainer = dContainer();

  let dMiddle = new ASprite(this, ctx, {
    width: mWidth,
    height: mHeight
  });

  let dTop = new ASprite(this, ctx, {
    width: tWidth,
    height: tHeight
  });

  let dRank = new AText(this, ctx, {
    size: tWidth,
  });

  let dHighlight = new ASprite(this, ctx, {
    width: cWidth + 2,
    height: cHeight + 2,
    texture: mcards['highlight']
  });

  let dBlackout = new ASprite(this, ctx, {
    width: cWidth,
    height: cHeight,
    texture: mcards['shadow']
  });

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dBg);


    container.c.addChild(dFrontContainer);

    dTop.anchor(0.5);
    dTop.container.move(tWidth * 0.5 + tMargin, tHeight * 0.5 + tMargin);
    dFrontContainer.addChild(dTop.container.c);

    dMiddle.anchor(0.5);
    dMiddle.container.move(cWidth - mWidth * 0.5 - tMargin, cHeight - mHeight * 0.5 - tMargin);
    dFrontContainer.addChild(dMiddle.container.c);

    dRank.container.move(cWidth - tWidth - tMargin,  tMargin);
    dFrontContainer.addChild(dRank.container.c);
    
    dHighlight.move(-1, -1);
    container.addChild(dHighlight);

    container.addChild(dBlackout);
    dBlackout.alpha(0);
  };
  initContainer();

  let n;

  let highlight;

  this.init = (data) => {
    n = data.n;
    highlight = data.highlight;

    this.highlight(highlight);

    dBg.texture(data.back ? mcards.back : mcards.front);

    if (data.back) {
      dFrontContainer.visible = false;
    } else {
      dFrontContainer.visible = true;
      dMiddle.texture(mcards[data.suit]);
      dTop.texture(mcards[data.suit]);
      dRank.setText(ranks[data.rank]);

      if (data.rank === 'ten') {
        dRank.container.move(cWidth - tWidth - tMargin * 4.0,  tMargin);
      } else {
        dRank.container.move(cWidth - tWidth - tMargin,  tMargin);
      }      
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

  this.blackout = (value) => {
    if (value) {
      dBlackout.alpha(0.2);
    } else {
      dBlackout.alpha(0);
    }
  };

  this.n = () => n;

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
