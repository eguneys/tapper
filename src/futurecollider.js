import Collt from './collt';

export default function FutureCollider(bounds, opts) {
  
  let collt = new Collt(bounds, opts);

  this.addRectangle = collt.addRectangle;
  this.clear = collt.clear;

  this.collides = (bounds) => {
    let res = [];
    collt.detectCollisionQ(bounds, _ => {
      res.push(_);
    });
    return res;
  };

  this.update = () => {
    collt.updateQ();
  };
  
}
