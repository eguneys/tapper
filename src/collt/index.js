import QuadTree from './qtree';
import { intersects } from './rect';

export default function Collt(bounds, opts) {

  let qtree = new QuadTree(bounds, opts || {});

  let collts = [];

  this.addRectangle = (data, r) => {
    let item = {
      data,
      r
    };
    collts.push(item);
    return item;
  };
  
  this.removeRectangle = (data) => {
    let i = collts.findIndex(_ => _.data === data);
    if (i > -1) {
      collts.splice(i, 1);
    }
  };

  this.queryRectangles = (r) => {
    return collts;
  };

  const updateQTree = () => {
    qtree.clear();
    collts.forEach(({ r }, i) => {
      r.i = i;
      qtree.insert(r);
    });
  };

  const queryQTree = (r) => {
    return qtree.query(r)
      .map(({i}) => collts[i]);
  };

  const testCandidates = (candidates, r) =>
        candidates.filter(_ => intersects(r, _.r));

  const detectCollision = (r) => {
    let candidates = this.queryRectangles(r);
    return testCandidates(candidates, r);
  };

  const detectCollisionWithQtree = (r) => {
    let candidates = queryQTree(r);
    return testCandidates(candidates, r);
  };

  this.detectCollision = (r) => detectCollision(r).map(_ => _.data);

  this.updateQ = () => {
    updateQTree();
  };

  this.detectCollisionQ = (r, onCollide) => {
    let colls = qtree.onRange(r, (({i}) => {
      let colt2 = collts[i];

      if (intersects(r, colt2.r)) {
        onCollide(colt2.data, colt2.r);
      }
    }));
  };

  this.detectPointQ = (x, y, onCollide) => {
    this.detectCollisionQ({ x, y, w: 1, h: 1 }, onCollide);
  };

  this.detectAllCollisions = (onCollide) => {

    updateQTree();

    collts.forEach(colt1 => {
      let colls = qtree.onRange(colt1.r, (({i}) => {
        let colt2 = collts[i];

        if (colt1 === colt2) { return; }

        if (intersects(colt1.r, colt2.r)) {
          onCollide(colt1.data, colt2.data, colt1.r, colt2.r);
        }
      }));
    });
  };

}
