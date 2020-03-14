import * as PIXI from 'pixi.js';

export default function Canvas(element) {
  
  let displayWidth = element.clientWidth,
      displayHeight = element.clientHeight;

  this.width = displayWidth;
  this.height = displayHeight;
  this.aspect = this.width / this.height;

  const app = this.app = new PIXI.Application({
    width: displayWidth,
    height: displayHeight
  });

  element.appendChild(app.view);  

  this.withApp = fn => fn(app);

  this.bounds = element.getBoundingClientRect();

  let memoizes = new WeakMemoizes();

  let listeners = new Listeners();

  this.resize = () => {

    let displayWidth = element.clientWidth,
        displayHeight = element.clientHeight,
        pixelRatio = window.devicePixelRatio || 1;

    this.pixelRatio = pixelRatio;
    this.width = displayWidth;
    this.height = displayHeight;


    this.aspect = this.width / this.height;

    this.bounds = element.getBoundingClientRect();

    app.resizeTo = element;
    app.resize();

    memoizes.clear();
    listeners.publish();
  };

  this.addResizeListener = (f) => {
    listeners.subscribe(f);
  };

  this.responsiveBounds = memoizes.setF(this);

  this.bindResize = () => bindResize(this);
};

export function bindResize(canvas) {
  unbindable(window, 'resize', onResize(canvas));
};

function onResize(canvas) {


  return (e) => {
    canvas.resize();
  };
};

function unbindable(el, eventName, callback) {
  el.addEventListener(eventName, callback);
  return () => el.removeEventListener(eventName, callback);
}


// https://stackoverflow.com/questions/58063501/how-to-create-a-dynamic-memoize-function-with-multiple-users-in-javascript
function WeakMemoizes() {

  let cached = new WeakMap();

  this.clear = () => cached = new WeakMap();

  this.setF = (...args) => f => {
    return () => {
      let result = cached.get(f);
      if (result === undefined) {
        cached.set(f, result = f(...args));
      }
      return result;
    };
  };
};

function Listeners() {
  let listeners = [];

  this.publish = () => {
    listeners.forEach(_ => _());
  };

  this.subscribe = f => {
    listeners.push(f);
  };
};
