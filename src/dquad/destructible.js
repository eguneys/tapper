import QuadTree from './quadtree';

export default function Destructible(x, y, w, h, state, depth) {

  let body = new QuadTree(x, y, w, h, state, depth);

  this.traverse = body.traverse;

  this.insertWithRectangle = (tRect, initialData, onUpdateOldData) => {
    body.insertWithRectangle(tRect, initialData, onUpdateOldData);
  };

  this.queryWithRectangle = (r, fn) => {
    body.queryWithRectangle(r, fn);
  };

  this.modifyByRectangle = (r, newState) => {
    body.updateWithRectangle(r, newState);
  };

  this.modifyByCircle = (c, newState) => {
    body.updateWithCircle(c, newState);
  };

}
