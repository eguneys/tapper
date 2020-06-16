import * as Bacon from 'baconjs';

export function ExtraValues(base) {

  let extra = this.extra = {};
  
  this.base = base;

  this.set = value => base = this.base = value;
  this.apply = fn => fn(base);
  this.applyExtra = (key, fn) => this.add(key, fn(base));

  this.add = (key, value) => extra[key] = value;
  this.remove = key => delete extra[key];

};



export function SyncBus() {
  let bus = this.bus = new Bacon.Bus();

  this.assign = pBase => {
    pBase.onValue(_ => bus.push(_));
  };
}
