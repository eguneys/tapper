import * as Bacon from 'baconjs';

import {isN } from './soliutils';

export function PSelectProperty(esSelect,
                                esDeselect) {
  
  let deselect = _ => {
    _.deselect();
    return _;
  };

  let select = (_, value) => {
    _.select(value);
    return _;
  };

  return Bacon.update(new PSelect(),
                      [esDeselect, deselect],
                      [esSelect, select]);
}


function PSelect() {
  
  let value = null;
  let previous = null;

  this.value = () => value;

  this.previous = () => previous;

  this.select = v => {
    if (value && v.equal(value)) {
      if (v.cardEqual(value)) {
        previous = value;
        value = null;
        return;
      }
    } else {
      previous = value;
    }
    value = v;
  };

  this.deselect = () => {
    previous = value;
    value = null;
  };

}


export function PSelectValue({
  stackN,
  cardN,
  drawN,
  holeN
}) {
  
  this.stackN = stackN;
  this.cardN = cardN;
  this.drawN = drawN;
  this.holeN = holeN;

  this.cardEqual = (value) => {
    return cardN === value.cardN;
  };

  this.equal = (value) => {
    if (isN(stackN)) {
      return stackN === value.stackN;
    } else if (drawN) {
      return drawN === value.drawN;
    } else if (isN(holeN)) {
      return holeN === value.holeN;
    }
  };

}
