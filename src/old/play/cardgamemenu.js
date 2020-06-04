import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import CandyBackground from './candybackground';
import CardMenuCard from './cardmenucard';

export default function CardGameMenu(play, ctx, pbs) {

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let bs = (() => {
    let { width, height } = pbs;

    let cRatio = 64 / 89;

    let cMargin = width * 0.1,
        cHeight = height - cMargin * 2,
        cWidth = cHeight * cRatio;
    cHeight = Math.round(cHeight);
    cWidth = Math.round(cWidth);

    let menucard = rect(cMargin, height * 0.5 - cHeight * 0.5, cWidth, cHeight);

    return {
      menucard,
      width,
      height
    };
  })();

  let cardGame;

  let dBg = new CandyBackground(this, ctx, bs);

  let dCardsContainer = dContainer();
  let dCards = [
    new CardMenuCard(this, ctx, {
      icon: mcards['hearts'],
      text: 'SOLI\nTAIRE',
      width: bs.menucard.width,
      height: bs.menucard.height,
      onTap() {
        cardGame.view('solitaire');
      }
    }),
    new CardMenuCard(this, ctx, {
      icon: mcards['clubs'],
      text: 'SPIDER',
      width: bs.menucard.width,
      height: bs.menucard.height,
      onTap() {
        cardGame.view('spider');
      }
    }),
    new CardMenuCard(this, ctx, {
      icon: mcards['diamonds'],
      text: 'FREE\nCELL',
      width: bs.menucard.width,
      height: bs.menucard.height,
      onTap() {
        cardGame.view('freecell');
      }
    }),
  ];

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);

    container.addChild(dCardsContainer);
    dCardsContainer.position.set(bs.menucard.x, bs.menucard.y);

    dCards.forEach((dCard, n) => {
      dCard.move(n * (bs.menucard.width + bs.menucard.width * 0.1), 0);
      dCard.add(dCardsContainer);
      components.push(dCard);
    });
  };
  initContainer();

  this.init = data => {
    cardGame = data.cardGame;
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

  this.visible = visible => container.visible = visible;

  this.move = (x, y) => container.position.set(x, y);
}
