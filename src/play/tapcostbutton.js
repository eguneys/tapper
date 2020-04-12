import { dContainer } from '../asprite';
import TapSprite from './tapsprite';
import TapButton from './tapbutton';
import TapText from './taptext';

import { shortenNumber } from './taputil';

export default function TapCostButton(play, ctx, bs) {

  const { textures } = ctx;

  let dCost = new TapButton(this, ctx, {
    width: bs.width,
    height: bs.height,
    textures: [textures['costButton'],
               textures['costButton']],
    onClick: bs.onClick
  });

  let textSize = bs.width * 0.1;

  let dCostIcon = new TapSprite(this, ctx, {
    width: textSize * 2.0,
    height: textSize * 2.0,
    texture: textures['coin']
  });

  let dCostText = new TapText(this, ctx, {
    size: textSize,
    textures: textures['letters']
  });

  let dCostText2 = new TapText(this, ctx, {
    size: textSize * 1.2,
    textures: textures['letters']
  });

  let components = [];

  const container = dContainer();
  const initContainer = () => {

    let costBounds = dCost.bounds();

    dCost.add(container);
    components.push(dCost);

    dCostText.move(10, costBounds.height - textSize - 16);
    dCostText.add(container);
    components.push(dCostText);

    dCostIcon.add(container);
    components.push(dCostIcon);
    dCostIcon.move(10, 12);

    dCostText2.move(36, 16);
    dCostText2.add(container);
    components.push(dCostText2);
  };
  initContainer();

  this.init = data => {
    let upgrade = data.upgrade;

    let cost = shortenNumber(upgrade.cost);

    dCostText.setText(`LEVEL UP`);
    dCostText2.setText(`${cost}`);
  };

  this.bounds = () => container.getBounds();

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.add = (parent) => {
    parent.addChild(container);
    return container;
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };
}
