import * as Bacon from 'baconjs';

import { makeEsTween } from './rtween';

export const makeFxTween = (value, duration, extras = {}) => {
  return Bacon.once({ ...extras,
                      tween: {
                        initial: true,
                        ...value } })
    .concat(makeEsTween(duration)
            .map(_ => ({ ...extras,
                         tween: {
                           i: _ }})))
    .concat(Bacon.once({ ...extras,
                         tween: {
                           end: true
                         }}));
};
