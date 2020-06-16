import * as Bacon from 'baconjs';

import { makeEsTween } from './rtween';

export const makeFxTween = (value, duration) => {
  return Bacon.once({ tween: {
    initial: true,
    ...value } })
    .concat(makeEsTween(duration)
            .map(_ => ({ tween: {
              i: _ }})))
    .concat(Bacon.once({ tween: {
      end: true
    }}));
  };
