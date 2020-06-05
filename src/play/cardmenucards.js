import { dContainer } from '../asprite';

import AContainer from './acontainer';

import iPol from '../ipol';
import { Easings } from '../ipol';

import ASprite from './asprite';
import AText from './atext';
 
import { tapHandler2 } from './util';

export default function CardMenuCards(play, ctx, bs) {

  let cardGame = this.cardGame = play.cardGame;

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let dCards = [
    new CardMenuCard(this, ctx, {
      icon: mcards['hearts'],
      text: 'SOLI\nTAIRE',
      width: bs.menucard.width,
      height: bs.menucard.height,
      onTap() {
        cardGame.userActionSelectGame('solitaire');
      }
    }),
    new CardMenuCard(this, ctx, {
      icon: mcards['clubs'],
      text: 'SPIDER',
      width: bs.menucard.width,
      height: bs.menucard.height,
      onTap() {
        cardGame.userActionSelectGame('spider');
      }
    }),
    new CardMenuCard(this, ctx, {
      icon: mcards['diamonds'],
      text: 'FREE\nCELL',
      width: bs.menucard.width,
      height: bs.menucard.height,
      onTap() {
        cardGame.userActionSelectGame('freecell');
      }
    }),
  ];

  let container = this.container = new AContainer();
  const initContainer = () => {
    dCards.forEach((dCard, n) => {
      dCard.container
        .move(n * (bs.menucard.width + bs.menucardGap), 
              0);

      container.addChild(dCard);
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

function CardMenuCard(play, ctx, bs) {

  const { events, textures } = ctx;

  let mcards = textures['mcards'];
  
  let { width, height } = bs;

  let iElevate = new iPol(0, 0, {});


  let dFrontContainer = dContainer();

  let dBg2 = new ASprite(this, ctx, {
    width: width,
    height: height,
    texture: mcards['shadow']
  });

  let dBg = new ASprite(this, ctx, {
    width: width,
    height: height,
    texture: mcards['front']
  });

  let dText = new AText(this, ctx, {
    size: height * 0.15
  });

  let dIcon = new ASprite(this, ctx, {
    width: width * 0.8,
    height: width * 0.8,
    texture: bs.icon
  });


  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg2);

    container.c.addChild(dFrontContainer);

    dFrontContainer.addChild(dBg.container.c);

    dIcon.move(width * 0.5 - width * 0.8 * 0.5,
               height - width * 0.9);
    dFrontContainer.addChild(dIcon.container.c);

    dText.container.move(bs.width * 0.05,
                         bs.height * 0.1);
    dFrontContainer.addChild(dText.container.c);
    dText.setText(bs.text);
  };
  initContainer();

  this.init = (data) => {
    
  };

  const elevateBegin = () => {
    iElevate.value(iElevate.value());
    iElevate.target(1);
  };

  const elevateEnd = () => {
    iElevate.value(iElevate.value());
    iElevate.target(0);
  };

  const handleTap = tapHandler2({
    onBegin() {
      elevateBegin();
    },
    onUpdate() {
    },
    onEnd(tapped) {
      elevateEnd();
      if (tapped) {
        bs.onTap();
      }
    },
    boundsFn: () => container.bounds()
  }, events);

  this.update = delta => {
    iElevate.update(delta / 200);
    handleTap(delta);
    this.container.update(delta);
  };

  let elevateW = width * 0.05,
      elevateH = height * 0.05;

  const renderElevation = () => {
    let vElevate = iElevate.easing(Easings.easeOutQuad);

    let eX = - elevateW * vElevate,
        eY = - elevateH * vElevate;

    dFrontContainer.position.set(eX, eY);

  };

  this.render = () => {
    renderElevation();
    this.container.render();
  };
}
