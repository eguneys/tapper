import * as PIXI from 'pixi.js';
import sprites from './sprites';

import Config from './config';
import Canvas from './canvas';
import Events from './events';
import Keyboard from './keyboard';
import Play from './play';

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
    .add('mtapper', aBase('tapper.png'))
    .load((loader, resources) => {

      const canvas = new Canvas(element);

      const textures = sprites(resources);

      const events = new Events(canvas);
      events.bindTouch();

      canvas.bindResize();

      const ctx = {
        canvas,
        config,
        textures,
        events
      };

      const data = {};

      play = new Play(ctx);

      play.init(data);

      canvas.withApp(app => {

        play.add(app.stage);

        app.ticker.add(delta => {

          delta = 16 / delta;

          events.update(delta);
          play.update(delta);
          play.render();
        });

        if (module.hot) {
          module.hot.accept('./play', function() {
            try {
              play.remove();
              play = new Play(ctx);
              play.init(data);
              play.add(app.stage);
            } catch (e) {
              console.log(e);
            }
          });
        }
      });
    });
}
