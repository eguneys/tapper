import AContainer from './acontainer';

import ASprite from './asprite';

import { tapHandler } from './util';

export default function CardAiControl(play, ctx, bs) {

  let cardGame = play.cardGame;

  const { events, textures } = ctx;

  const mhud = textures['mhud'];

  let dBg = new ASprite(this, ctx, {
    width: 48,
    height: 48,
    texture: mhud['menubg']
  });

  let dPlay = new ASprite(this, ctx, {
    width: 32,
    height: 32,
    texture: mhud['play']
  });


  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);
    container.addChild(dPlay);
    dPlay.container.move(48 * 0.5 - 32 * 0.5, (48 - 32) * 0.5);
  };
  initContainer();

  cardGame.ai.subscribe(ai => {
    let { play } = ai;

    dPlay.texture(mhud[play]);
  });

  this.init = (data) => {
    
  };

  const handleTap = tapHandler(() => {

    cardGame.userActionAiPlay();

  }, events, () => dPlay.container.bounds());

  this.update = delta => {
    handleTap();
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
