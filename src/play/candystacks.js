import Pool from 'poolf';

import { dContainer } from '../asprite';
import CandyCards from './candycards';

export default function CandyStacks(play, ctx, bs) {

  let dCards = [];

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  let stack;

  this.init = data => {

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
