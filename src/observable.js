import { callMaybe } from './util';

export const observable = instance => new Observable(instance);
export const pobservable = () => new PromiseObservable();

export default function Observable(instance) {

  let subs = [];

  this.apply = (getter) => getter(instance);

  this.mutate = (mutation) => {
    let res = mutation(instance);

    subs.forEach(_ => _(instance));

    return res;
  };

  this.subscribe = (fn) => subs.push(fn);

  this.unsubscribe = (fn) => subs.splice(subs.indexOf(fn), 1);
}

export function PromiseObservable() {
  
  let subs = [];

  let running;
  let rresolve;

  this.begin = (value) => {
    if (!running) {
      running = new Promise(resolve => {
        rresolve = resolve;
        subs.forEach(_ => _.onBegin(value, resolve));
      }).finally(_ => {
        running = undefined;
        rresolve = undefined;
        subs.forEach(_ => callMaybe(_.onEnd));
      });
    }
    return running;
  };

  this.resolve = (data) => {
    if (rresolve) {
      rresolve(data);
    }
  };

  

  this.subfun = (fn) => this.subscribe({ onBegin: fn });

  this.subscribe = (fn) => subs.push(fn);

  this.unsubscribe = (fn) => subs.splice(subs.indexOf(fn), 1);
}
