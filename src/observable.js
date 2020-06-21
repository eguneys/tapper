import { callMaybe } from './util';

export const observable = instance => new Observable(instance);
export const pobservable = () => new PromiseObservable();

export default function Observable(instance) {

  let subs = [];

  this.apply = (getter) => getter(instance);

  this.set = (mutation) => {
    instance = mutation(instance);

    subs.forEach(_ => _(instance));

    return instance;
  };

  this.mutate = (mutation) => {
    let res = mutation(instance);

    subs.forEach(_ => _(instance));

    return res;
  };

  this.subscribe = (fn) => subs.push(fn);

  this.unsubscribe = (fn) => subs.splice(subs.indexOf(fn), 1);

  this.log = (fn = _ => _) => {
    this.subscribe(_ => console.log(fn(_)));
  };
}

export function PromiseObservable() {
  
  let subs = [];

  let running;
  let rresolve,
      rreject;

  this.begin = (value) => {
    if (!running) {
      running = new Promise((resolve, reject) => {
        rresolve = resolve;
        rreject = reject;

        subs.forEach(_ => _.onBegin(value, resolve, reject));
      }).finally(_ => {
        running = undefined;
        rresolve = undefined;
        rreject = undefined;
        subs.forEach(_ => callMaybe(_.onEnd));
      });
    }
    return running;
  };

  this.reject = () => {
    if (rreject) {
      rreject();
    }
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
