import { hitTest } from './util';

export const fEInBounds = (fSelect, fBounds) => {
  return event => {
    let bs = fSelect(event);
    return hitTest(...bs, fBounds());
  };
};

