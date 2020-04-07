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
  
  PIXI.Loader.shared
    .add('hud', aBase('Sprite-Hud-0001.json'))
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
          events.update(delta);
          play.update(delta);
          play.render();
        });
      });

    });
}
