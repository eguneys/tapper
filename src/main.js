import * as PIXI from 'pixi.js';
import sprites from './sprites';

import Config from './config';
import Canvas from './canvas';
import Events from './events';
import Keyboard from './keyboard';
import Play from './play';

export function app(element, options) {

  const config = Config();

  let play;

  let assetsBase = 'assets/images/';
  const aBase = (url) => assetsBase + url;

  // https://pixijs.download/dev/docs/PIXI.settings.html
  // PIXI.settings.RESOLUTION = window.devicePixelRatio;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  PIXI.Loader.shared
    .add('mall', aBase('all.png'))
    .add('mletters', aBase('letters.png'))
    .add('fletters', aBase('fletters.png'))
    .add('flettersjson', aBase('fletters.json'))
    .load((loader, resources) => {

      const canvas = new Canvas(element);

      const textures = sprites(resources);

      const events = new Events(canvas);
      events.bindTouch();

      const keyboard = new Keyboard();
      keyboard.bind();

      canvas.bindResize();

      const ctx = {
        canvas,
        keyboard,
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
