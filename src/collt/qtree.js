// https://github.com/timohausmann/quadtree-js/blob/master/quadtree.js
export default function QTree(bounds, opts, level = 0) {

  let {
    maxObjects = 10,
    maxLevels = 4,
  } = opts;
  
  let objects = [],
      nodes = [];

  const split = () => {
    let nextLevel = level + 1,
        subWidth = bounds.width / 2,
        subHeight = bounds.height / 2,
        x = bounds.x,
        y = bounds.y;

    nodes[0] = new QTree({
      x: x + subWidth,
      y,
      width: subWidth,
      height: subWidth
    }, opts, nextLevel);

    nodes[1] = new QTree({
      x,
      y,
      width: subWidth,
      height: subWidth
    }, opts, nextLevel);

    nodes[2] = new QTree({
      x,
      y: y + subHeight,
      width: subWidth,
      height: subWidth
    }, opts, nextLevel);

    nodes[3] = new QTree({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subWidth
    }, opts, nextLevel);
  };

  const getIndex = (pRect) => {
    let indexes = [],
        verticalMidpoint = bounds.x + bounds.width / 2,
        horizontalMidpoint = bounds.y + bounds.height / 2;

    let startIsNorth = pRect.y < horizontalMidpoint,
        startIsWest = pRect.x < verticalMidpoint,
        endIsEast = pRect.x + pRect.w > verticalMidpoint,
        endIsSouth = pRect.y + pRect.h > horizontalMidpoint;

    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }

    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }

    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
  };


  this.insert = (pRect) => {

    let indexes;

    if (nodes.length > 0) {
      indexes = getIndex(pRect);
      for (let i = 0; i < indexes.length; i++) {
        nodes[indexes[i]].insert(pRect);
      }
      return;
    }

    objects.push(pRect);

    if (objects.length > maxObjects && level < maxLevels) {
      if (nodes.length === 0) {
        split();
      }

      for (let i = 0; i < objects.length; i++) {
        indexes = getIndex(objects[i]);
        for (let k = 0; k < indexes.length; k++) {
          nodes[indexes[k]].insert(objects[i]);
        }
      }
      objects = [];
    }
  };


  this.query = (pRect) => {
    let indexes = getIndex(pRect),
        returnObjects = objects;

    if (nodes.length > 0) {
      for (let i = 0; i < indexes.length; i++) {
        returnObjects = returnObjects
          .concat(nodes[indexes[i]]
                  .query(pRect));
      }
    }

    // returnObjects = returnObjects.filter((item, index) => {
    //   return returnObjects.indexOf(item) >= index;
    // });
    return returnObjects;
  };

  this.onRange = (pRect, onRange) => {
    let indexes = getIndex(pRect);

    objects.forEach(onRange);

    if (nodes.length > 0) {
      for (let i = 0; i < indexes.length; i++) {
        nodes[indexes[i]].onRange(pRect, onRange);
      }
    }
  };


  this.clear = () => {
    objects = [];

    if (nodes.length > 0) {
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].clear();
      } 
    }

    nodes = [];
  };
}
