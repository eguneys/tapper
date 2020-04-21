export default function PromiseMaker({ name = "Promise" }) {
  
  let resolve, reject;

  this.reject = () => {
    if (reject) {
      reject(name + " cancelled");
    }

    resolve = undefined;
    reject = undefined;
  };

  this.resolve = () => {
    if (resolve) {
      resolve();
    }
    resolve = undefined;
    reject = undefined;
  };

  this.settled = () => {
    return !resolve;
  };

  this.begin = () => {
    return new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  };

}
