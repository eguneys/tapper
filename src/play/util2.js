import iPol from '../ipol';
import { callMaybe } from './util';

export function iPolPlus({ 
  onBegin,
  onUpdate,
  onEnd }) {

  let p = this.p = new iPol(0, 0, {});
  let res;

  let value;

  this.begin = (v, resolve) => {
    res = resolve;
    value = v;
    p.both(0, 1);
    callMaybe(onBegin, value);
  };

  const resolve = () => {
    callMaybe(onEnd, value);
    res();
    res = undefined;
    value = undefined;
  };

  this.update = delta => {
    p.update(delta);
    if (res) {
      callMaybe(onUpdate, value, p.value());
    }
    if (p.settled() && res) {
      resolve();
    }
  };
}
