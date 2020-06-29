import { withDelay } from '../util';
import * as mu from 'mutilz';
import Pool from 'poolf';
import AContainer from './acontainer';
import CardCard from './cardcard';

import iPol from '../ipol';
import { backCard } from '../cards';

export default function CScreenTransition(play, ctx, bs) {

  let pShapes = new Pool(() => 
    new Shape(this, ctx, bs));

  let container = this.container = new AContainer();
  const initContainer = () => {};
  initContainer();

  const addShape = () => {
    let x = mu.rand(0, bs.width);
    let dShape = pShapes
        .acquire(_ => _.init({ x }));
    container.addChild(dShape);
  };

  this.releaseShape = dShape => {
    container.removeChild(dShape);
    pShapes.release(dShape);
  };

  let iLife = new iPol(0, 0, {});

  this.init = (data) => {
    iLife.both(0, 1);
  };

  const maybeAddShape = withDelay(() => {
    if (iLife.settled()) {
      return;
    }
    for (let i = 0; i < 20; i++) {
      addShape();
    }
  }, 50, {});

  this.update = delta => {
    iLife.update(delta / 1000);
    maybeAddShape(delta);
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}

function Shape(play, ctx, bs) {

  let dBody = new CardCard(this, ctx, bs);

  let container = this.container = new AContainer();

  let iLife = new iPol(0, 0, {});

  const initContainer = () => {
    container.addChild(dBody);
  };
  initContainer();

  let startAngle = mu.rand(0, Math.PI);

  this.init = (data) => {
    let { x } = data;

    dBody.init(backCard);
    iLife.both(0, 1);
    this.container.moveX(x);
  };

  const updateLife = () => {
    if (iLife.value() === 1 && iLife.settled()) {
      play.releaseShape(this);
    }
  };

  this.update = delta => {
    iLife.update(delta / 1000);
    updateLife();
    this.container.update(delta);
  };

  this.render = () => {
    let vLife = iLife.value();

    let y = - 2.0 * bs.card.height + 
        (1.0 - vLife) * (bs.height +
                         bs.card.height * 2.0);

    this.container.rotation(startAngle + vLife * Math.PI);
    this.container.moveY(y);
    this.container.render();
  };
}
