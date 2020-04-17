export default function FutureShoots(future, bs) {
  
  let shoots;

  this.init = () => {
  };

  this.shoot = (x, y) => {
    if (x) {
      shoots = { x, y };
    }
    return shoots;
  };


  this.update = delta => {
    
  };

}
