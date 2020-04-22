import { fallPoss, allKeys, key2pos, pos2key, randomResource, neighborPoss } from './candyutil';

import PMaker from './pmaker';
import ipol from './ipol';

export default function Candy() {
  const data = this.data = {
    ground: {},
    fxs: {}
  };

  let viCollect = new ViewIPol(data, 'collects', 300);

  let viFalls = {};
  allKeys.forEach(key => {

    let fx = {};
    viFalls[key] = new ViewIPol(fx, 'falls', 300);
    data.fxs[key] = fx;
  });

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
      beginConsume({
        keys: neighbors,
        resource: resource(key)
      });
    }
  };

  const beginConsume = (consumes) => {
    consumes.keys.forEach(key => {
      let g = ground(key);
      g.trail = true;
    });
    viCollect.begin(consumes);
  };

  const beginFall = (key, toKey) => {
    let g = ground(key);
    g.trail = true;
    viFalls[key].begin({
      to: toKey,
      resource: g.resource
    }).then(() => {
      let fG = ground(toKey);
      fG.trail = false;
      fG.resource = g.resource;
    });
  };

  const updateFalls = (delta) => {
    for (let key in viFalls) {
      viFalls[key].update(delta);
    }

    for (let key in data.ground) {
      let pos = key2pos(key);
      let g = ground(key);
      if (g.trail) {
        let fP = fallPoss(pos);
        if (fP) {
          let fK = pos2key(fP);
          let fG = ground(fK);

          if (!fG.trail) {
            beginFall(fK, key);
          }
        } else {

        }
      }
    }
  };
  
  this.update = (delta) => {
    updateFalls(delta);
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
    iPol.update(delta / duration);

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
