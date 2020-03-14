export default function Keyboard() {

  let state = this.data = {
  };

  const makeDirEvent = fn => {
    return dir => e => {
      if (e.code === dir) {
        fn(dir);
      }
    };
  };

  const dirMap = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'Space': 'space',
    'Enter': 'enter',
    'Escape': 'escape'
  };

  const allDirs = ['left', 'right', 'up', 'down', 'space', 'enter', 'escape'];

  const onKeyDown = makeDirEvent(dir => {
    state[dirMap[dir]] = true;
  });

  const onKeyUp = makeDirEvent(dir => {
    state[dirMap[dir]] = false;
  });

  this.update = delta => {
    
  };

  this.bind = () => {
    let keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape'];

    keys.forEach(dir => {
      unbindable(document, 'keydown', onKeyDown(dir));
      unbindable(document, 'keyup', onKeyUp(dir));
    });
  };
  
}

function unbindable(el, eventName, callback) {
  el.addEventListener(eventName, callback);
  return () => el.removeEventListener(eventName, callback);
}
