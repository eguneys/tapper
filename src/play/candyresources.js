import { dContainer } from '../asprite';
import iPol from '../ipol';
import { Easings, Easings2 } from '../ipol';

import { formatNumber } from './tap/taputil';

import { fxHandler } from './util';
import TapSprite from './tapsprite';
import Tap3 from './tap3';
import FText from './ftext';

export default function CandyResources(play, ctx, bs) {

  const { textures: { mall } } = ctx;

  let dWood = new CandyResource(this, ctx, {
    ...bs,
    key: 'wood',
    texture: mall['wood']
  });
  let dGold = new CandyResource(this, ctx, {
    ...bs,
    key: 'gold',
    texture: mall['gold']
  });
  let dFood = new CandyResource(this, ctx, {
    ...bs,
    key: 'food',
    texture: mall['food']
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dWood.add(container);
    components.push(dWood);
    dWood.move(0, 0);

    dGold.add(container);
    components.push(dGold);
    dGold.move(0, bs.resource.height + bs.margin);

    dFood.add(container);
    components.push(dFood);
    dFood.move(0, (bs.resource.height + bs.margin) * 2.0);
  };
  initContainer();

  let candy;
  this.init = data => {
    candy = data.candy;

    dWood.init({candy});
    dGold.init({candy});
    dFood.init({candy});
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

  this.move = (x, y) => container.position.set(x, y);
}

function CandyResource(play, ctx, bs) {

  const { textures: { mall } } = ctx;

  let { key } = bs;

  let rW = bs.resource.height;

  let iScale = new iPol(0, 0, {yoyo: 1});

  let dResource = new TapSprite(this, ctx, {
    width: rW,
    height: rW,
    texture: bs.texture
  });

  let dBg = new Tap3(this, ctx, {
    width: bs.resource.width,
    height: bs.resource.height,
    tileWidth: 16,
    textures: mall['resourcebg3']
  });

  let dText = new FText(this, ctx, {
    size: bs.resource.height - bs.margin * 2.0
  });

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dBg.add(container);
    components.push(dBg);
    dBg.move(bs.resource.height, 0);

    dResource.add(container);
    components.push(dResource);

    dText.add(container);
    components.push(dText);
    dText.move(bs.resource.height * 1.5,
               bs.margin);
  };
  initContainer();

  let candy,
      resource;

  this.init = data => {
    candy = data.candy;
    iScale.both(0, 0);

    resource = candy.data.resources[key];
  };

  let shouldCollects = false;
  const handleCollects = fxHandler({
    onBegin({resource}) {
      if (resource === key) {
        shouldCollects = true;
      }
    },
    onUpdate(collects, i) {},
    onEnd() {
      if (shouldCollects) {
        shouldCollects = false;
        iScale.both(0, 1);
      }
    },
  }, () => candy.data.collects);

  let iScoreExtend;
  const handleScore = fxHandler({
    onBegin({ value }) {
      iScoreExtend = 0;
    },
    onUpdate({ value }, i) {
      iScoreExtend = Math.floor(i * value);
    },
    onEnd() {
      iScoreExtend = undefined;
    },
    duration: 300
  }, () => resource.fx.scores);

  this.update = delta => {
    iScale.update(delta / 100);
    handleCollects(delta);
    handleScore(delta);
    components.forEach(_ => _.update(delta));
  };

  const renderResource = () => {
    let vScale = iScale.easing(Easings.easeInQuad);
    let extend = rW * 0.2;
    extend *= vScale;
    dResource.size(rW + extend, rW + extend);

  };

  const renderScore = () => {
    let { value } = resource;

    if (iScoreExtend) {
      value += iScoreExtend;
    }

    let scoreText = formatNumber(value);

    dText.setText(scoreText);
  };

  this.render = () => {
    renderResource();
    renderScore();
    components.forEach(_ => _.render());
  };


  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);
}
