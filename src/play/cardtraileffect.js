import { withDelay } from '../util';
import * as v from '../vec2';
import iPol from '../ipol';
import { Easings } from '../ipol';
import Pool from 'poolf';
import AContainer from './acontainer';
import CardCard from './cardcard';

// https://stackoverflow.com/questions/14627566/rounding-in-steps-of-20-or-x-in-javascript
function round(number, increment) {
  return Math.round(number / increment) * increment;
}

export default function CardTrailEffect(play, ctx, bs) {

  let pTrail = new Pool(() => new CardTrailOne(this, ctx, bs));

  let dCard = new CardCard(this, ctx, bs);

  let iPath = new iPol(0, 0, {});

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dCard);
  };
  initContainer();

  let card;

  let vOrig,
      vDiff;

  let vPosition;

  this.init = (data) => {

    pTrail.each(_ => container.removeChild(_));
    pTrail.releaseAll();

    let { card: _card, orig, dest } = data;

    card = _card;

    vOrig = orig;
    vDiff = v.csub(dest, orig);

    dCard.init({
      ...card
    });

    iPath.both(0, 1);
  };

  const updatePath = () => {
    let vPathi = iPath.easing(Easings.easeInOutQuad);

    let vDiffi = v.cscale(vDiff, vPathi);
    vPosition = v.cadd(vOrig, vDiffi);
  };

  const addTrail = () => {

    let dTrail = pTrail.acquire(_ => _.init(card));

    dTrail.container.move(...vPosition);
    container.addChild(dTrail);
  };

  this.releaseTrail = (dTrail) => {
    container.removeChild(dTrail);
    pTrail.release(dTrail);
  };

  const maybeAddTrail = withDelay(() => {
    if (iPath.settled()) {
      return;
    }
    addTrail();
  }, 50, {});

  this.update = delta => {
    iPath.update(delta / 300);

    updatePath();

    maybeAddTrail(delta);

    this.container.update(delta);
  };

  this.render = () => {

    if (vPosition) {
      dCard.container.move(...vPosition);
    }

    this.container.render();
  };
}

function CardTrailOne(play, ctx, bs) {

  let dCard = new CardCard(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dCard);
  };
  initContainer();

  let iLife = new iPol(0, 0, {});

  this.init = (card) => {
    dCard.init(card);
    iLife.both(0, 1);
  };

  const maybeKill = () => {
    if (iLife.settled()) {
      play.releaseTrail(this);
    }
  };


  this.update = delta => {
    maybeKill();
    iLife.update(delta / 500);
    this.container.update(delta);
  };

  this.render = () => {
    let vLife = iLife.value();

    let alpha = 1.0 - vLife;

    alpha = round(alpha, 0.3);

    dCard.container.scale(alpha, alpha);
    dCard.container.alpha(alpha);

    this.container.render();
  };
}
