import { allKeys, key2pos, pos2key, randomResource, neighborPoss } from './candyutil';

import PMaker from './pmaker';
import ipol from './ipol';

export default function Candy() {
  const data = this.data = {
    ground: {}
  };

  let viCollect = new ViewIPol(data, 'collects', 0.001);

  this.init = () => {
    data.ground = {};

    allKeys.forEach(key => {
      data.ground[key] = {
        key,
        resource: randomResource()
      };
    });

  };

  const ground = key => data.ground[key];
  const resource = key => data.ground[key].resource;

  const sameNeighbors = (key) => {
    let seekResource = resource(key);
    let result = [];
    sameNeighborsHelper(key, seekResource, [], result);
    return result;
  };

  const sameNeighborsHelper = (key, seekResource, visited, result) => {
    let pos = key2pos(key);
    let neighbors = neighborPoss(pos);
    let _resource = resource(key);
    visited.push(key);
    if (_resource === seekResource) {
      result.push(key);
      let unseens = neighbors.filter(pos => !visited.includes(pos2key(pos)));
      unseens.forEach(_ => 
        sameNeighborsHelper(pos2key(_), seekResource, visited, result));
    }
  };

  this.tap = (key) => {
    let neighbors = sameNeighbors(key);
    if (neighbors.length > 2) {
      beginConsume(neighbors);
    }
  };

  const beginConsume = (consumes) => {
    viCollect.begin(consumes);
  };

  
  this.update = (delta) => {
    viCollect.update(delta);
  };
  
  
}

function ViewIPol(data, key, duration) {
  let pRes = new PMaker({ name: `View IPol ` + key });
  let iPol = new ipol(0, 0, {});

  this.begin = (value) => {
    data[key] = {
      value,
      iPol
    };
    iPol.both(0, 1);
    return pRes.begin();
  };

  this.update = (delta) => {
    iPol.update(delta * duration);

    if (data[key]) {
      let vPol = iPol.value();
      data[key].i = vPol;

      if (iPol.settled()) {
        delete data[key];
        pRes.resolve();
      }
    }
  };
}
