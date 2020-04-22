import { dContainer } from '../asprite';
import { throttle } from '../util';
import { tapHandler } from './util';
import TapSprite from './tapsprite';

const frameByState = {
  'sleeping': 'sleep',
  'idle': 'idle'
};

export default function TapGame(play, ctx, bs) {

  const { events, textures } = ctx;

  let dHero = new TapSprite(this, ctx, {
    width: bs.hero.width,
    height: bs.hero.height,
    texture: textures['mall']['sleep']
  });


  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dHero.add(container);
    components.push(dHero);
  };
  initContainer();

  let tapper;

  this.init = data => {
    tapper = data.tapper;
    dHero.init({});
  };

  const tapBounds = () => bs.tap;

  const safeTap = throttle((x, y) => {
    tapper.tap('tap', x, y);
  }, 100);

  let handleTap = tapHandler(events, tapBounds, safeTap);

  const updateState = () => {
    let morphy = tapper.morphy();

    let state = morphy.state();

    let frame = frameByState[state.key];

    let pos = morphy.pos();

    dHero.texture(textures['mall'][frame]);

    dHero.move(pos.x, 
               pos.y);
  };

  this.update = delta => {
    handleTap();
    updateState();
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


}
