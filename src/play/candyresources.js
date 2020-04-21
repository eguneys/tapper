import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import Tap3 from './tap3';
import FText from './ftext';

export default function CandyResources(play, ctx, bs) {

  const { textures: { mall } } = ctx;

  let dWood = new CandyResource(this, ctx, {
    ...bs,
    texture: mall['wood']
  });
  let dGold = new CandyResource(this, ctx, {
    ...bs,
    texture: mall['gold']
  });
  let dFood = new CandyResource(this, ctx, {
    ...bs,
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

  this.init = data => {
    dWood.init({});
    dGold.init({});
    dFood.init({});
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}

function CandyResource(play, ctx, bs) {

  const { textures: { mall } } = ctx;

  let dResource = new TapSprite(this, ctx, {
    width: bs.resource.height,
    height: bs.resource.height,
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

  this.init = data => {
    dText.setText('1,000');
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
