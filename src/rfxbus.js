import * as Bacon from 'baconjs';

const makeEsTween = (duration = 20) =>
      Bacon.sequentially(duration/11, [0, 
                                       0.1,
                                       0.2,
                                       0.3,
                                       0.4,
                                       0.5,
                                       0.6,
                                       0.7,
                                       0.8,
                                       0.9,
                                       1.0]);

export default function FxBus() {

  let bFx = this.bFx = new Bacon.Bus();

  const fxUpdate = (name, value) => {
    bFx.push({ name, append: value });
  };

  const fxInit = (name, value) => {
    bFx.push({ name, init: value});
  };

  const fxDelete = name => fxInit(name, {});

  const initWithFx = (value, fxName) => {
    return Bacon.once(false).
      doAction(_ => {
        fxInit(fxName, value);
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
                fxDelete(fxName);
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
