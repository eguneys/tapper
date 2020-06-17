import * as Bacon from 'baconjs';

export function PSelectProperty(esSelect,
                                esDeselect) {
  
  let deselect = _ => {
    return null;
  };

  let select = (_, { value }) => {
    return value;
  };

  return Bacon.update(null,
                      [esDeselect, deselect],
                      [esSelect, select]);
}
