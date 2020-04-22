import { fallPoss, allKeys, key2pos, pos2key, randomResource, neighborPoss } from './candyutil';

import PMaker from './pmaker';
import ipol from './ipol';

export default function Candy() {
  const data = this.data = {
    ground: {},
    fxs: {}
  };

  let frame;

  const onFallEnd = ({ to, resource }) => {
    let fG = ground(to);
    fG.trail = false;
  };

  let fxCollect = new Fx(data, 'collects');

  let fxFalls = {};
  allKeys.forEach(key => {

    let fx = {};
    fxFalls[key] = new Fx(fx, 'falls', onFallEnd);
    data.fxs[key] = fx;
  });

  this.init = () => {
    frame = 0;
    data.ground = {};

    allKeys.forEach(key => {
      data.ground[key] = {
        key,
        resource: randomResource(),
        frame
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
      doConsume(neighbors, resource(key));
    }
  };

  const doConsume = (keys, resource) => {
    keys.forEach(key => {
      let g = ground(key);
      g.trail = true;
    });

    fxCollect.begin({
      keys,
      resource
    });
  };

  const doFall = (fromKey, toKey) => {
    let fromG = ground(fromKey);
    let toG = ground(toKey);

    fromG.trail = true;
    toG.resource = fromG.resource;

    fxFalls[toKey].begin({
      to: toKey,
      from: fromKey,
      resource: fromG.resource
    });
  };

  const updateFalls = (delta) => {
    for (let key in data.ground) {
      let pos = key2pos(key);
      let g = ground(key);
      if (g.frame === frame) {
        continue;
      }
      g.frame = frame;
      if (g.trail) {
        let fP = fallPoss(pos);
        if (fP) {
          let fK = pos2key(fP);
          let fG = ground(fK);

          if (!fG.trail) {
            fG.frame = frame;
            doFall(fK, key);
          }
        } else {

        }
      }
    }
  };

  const updateFxs = delta => {
    fxCollect.update(delta);
    for (let key in fxFalls) {
      fxFalls[key].update(delta);
    }
  };
  
  this.update = (delta) => {
    frame++;
    updateFxs(delta);
    updateFalls(delta);
  };
  
  
}

function Fx(data, key, onEnd = () => {}) {

  let state = {};

  this.begin = (value) => {
    state.value = value;
    data[key] = state;
  };

  const end = () => {
    onEnd(state.value);
    state.value = undefined;
    delete data[key];
  };

  this.update = (delta) => {
    if (state.end) {
      state.end = false;
      end();
    }
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
