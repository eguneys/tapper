import { rect } from '../dquad/geometry';

import AContainer from './acontainer';

import CardBackground from './cardbackground';
import CardMenuCards from './cardmenucards';

export default function CardGameMenu(play, ctx, pbs) {

  this.cardGame = play.cardGame;

  let bs = (() => {
    let { width, height } = pbs;

    let cRatio = 64 / 89;

    let cMargin = width * 0.14,
        cHeight = height - cMargin * 2,
        cWidth = cHeight * cRatio;
    cHeight = Math.round(cHeight);
    cWidth = Math.round(cWidth);

    let menucardGap = cWidth * 0.1;

    let menucard = rect((width - (menucardGap + cWidth) * 3.0) * 0.5,
                        height * 0.5 - cHeight * 0.5,
                        cWidth, cHeight);

    return {
      menucardGap,
      menucard,
      width,
      height
    };
  })();

  let dBg = new CardBackground(this, ctx, bs);

  let dCards = new CardMenuCards(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dBg);

    dCards.container.move(bs.menucard.x, bs.menucard.y);
    container.addChild(dCards);
    
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.remove = () => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
