import * as Bacon from 'baconjs';

import { makeEsTween } from './rtween';

export default function FxBus() {

  let bFx = this.bFx = new Bacon.Bus();

  const fxUpdate = (key, value) => {
    bFx.push({ name: key, update: { key, value } });
  };

  const fxRemove = key => {
    bFx.push({ name: key, remove: key });
  };

  const initWithFxEs = this.initWithFxEs = (es, pullValue, fxName) => {
    return es.doAction(_ => {
      fxUpdate(fxName, pullValue(_));
    }).take(0);
  };

  const initWithFx = (value, fxName) => {
    return Bacon.once(false).
      doAction(_ => {
        fxUpdate(fxName, value);
      }).filter(_ => _);
  };

  let prependWithFx = this.prependWithFx = (value, fxName, duration) => {
    return makeEsTween(duration)
      .doAction(_ => {
        fxUpdate(fxName, { i: _ });
      })
      .filter(_ => false)
      .concat(Bacon.once(value)
              .doAction(_ => {
                fxRemove(fxName);
              }));
  };

  this.initPrependWithFx = (fxName, 
                            initValue,
                            afterValue,
                            duration) => {
                              return initWithFx(initValue, fxName)
                                .concat(prependWithFx(afterValue, 
                                                      fxName, duration));
                            };
}
