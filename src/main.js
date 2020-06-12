import * as PIXI from 'pixi.js';
import sprites from './sprites';

import Config from './config';
import Canvas from './canvas';
import Events from './events';
import Keyboard from './keyboard';
import Play from './play';

import Revents from './revents';

export function app(element, options) {

  const config = Config(options);

  let play;

  let assetsBase = config.assetsBase;
  const aBase = (url) => assetsBase + url;

  // https://pixijs.download/dev/docs/PIXI.settings.html
  // PIXI.settings.RESOLUTION = window.devicePixelRatio;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  PIXI.Loader.shared
    .add('mall', aBase('all.png'))
    .add('greenbg', aBase('greenbg.png'))
    .add('mcards', aBase('cards.png'))
    .add('mhud', aBase('hud.png'))
    .add('mbg', aBase('bg.png'))
    .add('mletters', aBase('letters.png'))
    .add('fletters', aBase('fletters.png'))
    .add('flettersjson', aBase('fletters.json'))
    .add('pletters', aBase('pletters.png'))
    .add('plettersjson', aBase('pletters.json'))
    .add('mtapper', aBase('tapper.png'))
    .load((loader, resources) => {

      const canvas = new Canvas(element);

      const textures = sprites(resources);

      const events = new Events(canvas);
      events.bindTouch();

      canvas.bindResize();

      const revents = new Revents(canvas);

      const ctx = {
        canvas,
        config,
        textures,
        events,
        revents
      };

      const data = {};

      play = new Play(ctx);

      play.init(data);

      canvas.withApp(app => {

        app.stage.addChild(play.container.c);

        app.ticker.add(delta => {

          delta = 16 / delta;

          events.update(delta);
          play.update(delta);
          play.render();
        });

        if (module.hot) {
          module.hot.accept('./play', function() {
            try {
              app.stage.removeChild(play.container.c);
              play = new Play(ctx);
              play.init(data);
              app.stage.addChild(play.container.c);
            } catch (e) {
              console.log(e);
            }
          });
        }
      });
    });
}
