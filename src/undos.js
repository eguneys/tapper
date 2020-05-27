export default function Undos(ctx) {
  let undos;

  this.init = (data = []) => {
    undos = data;
  };

  this.undo = () => {
    if (undos.length === 0) {
      return;
    }

    let undo = undos.pop();
    undo(ctx);
  };

  this.push = (fn) => {
    undos.push(fn);
  };

  
}
