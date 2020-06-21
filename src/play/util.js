import * as v from '../vec2';

export function callMaybe(fn, ...args) {
  if (fn) { fn(...args);  }
};

export function moveHandler({ onBegin,
                              onUpdate,
                              onEnd }, events) {

  let running;

  return () => {
    const { current } = events.data;
    if (current) {
      let { epos } = current;
      if (!running) {
        onBegin(epos);
      } else {
        onUpdate(epos);
      }
      running = epos;
     } else {
      if (running) {
        onEnd(running);
        running = undefined;
      }
    }
  };
  
}

export function moveHandler2({ onBegin,
                               onMove,
                               onEnd, 
                               threshold = 20 
                             }, events) {

  const runBegin = 'begin';
  const runMoving = 'moving';
  const runEnd = 'end';

  let runningArgs;
  let running = runEnd;

  let startPos;

  return () => {
    const { current } = events.data;
    if (current) {
      let { epos } = current;
      if (running === runEnd) {
        callMaybe(onBegin, epos);
        startPos = epos;
        running = runBegin;
        runningArgs = epos;
      } else if (running === runBegin) {
        let dist = v.distance(startPos, epos);
        if (dist > threshold) {
          running = runMoving;
        }
      } else {
        callMaybe(onMove, epos);
        runningArgs = epos;
      }
     } else {
      if (running === runBegin || running === runMoving) {
        callMaybe(onEnd, runningArgs);
      }
       running = runEnd;
    }
  };
  
}

export function tapHandler2({ onBegin,
                              onUpdate,
                              onEnd,
                              boundsFn }, events) {

  const runBegin = 'running';
  const runCancel = 'cancel';
  const runEnd = 'end';

  let running = runEnd;

  return () => {
    const { current } = events.data;
    if (current) {
      let { epos } = current;
      if (running === runEnd) {
        if (hitTest(...epos, boundsFn())) {
          callMaybe(onBegin, epos);
          running = runBegin;
        } else {
          running = runCancel;
        }
      } else if (running === runCancel) {
        
      } else if (running === runBegin) {
        if (hitTest(...epos, boundsFn())) {
          callMaybe(onUpdate, epos);
        } else {
          callMaybe(onEnd, false);
          running = runCancel;
        }
      }
     } else {
      if (running === runBegin) {
        callMaybe(onEnd, true);
        running = runEnd;
      } else if (running === runCancel) {
        running = runEnd;
      }
    }
  };
  
}

export function tapHandler(fn, events, boundsFn) {
  return () => {
    const { current } = events.data;

    if (current) {
      let { ending, epos } = current;

      if (ending) {
        let { swipe: { swiped } } = ending;

        if (!swiped & hitTest(...epos, boundsFn())) {
            fn(...epos);
        }
      }
    }
  };
};

export const hitTest = (posX, posY, bounds) => {
  let left = bounds.x,
      right = bounds.x + bounds.width,
      top = bounds.y,
      bottom = top + bounds.height;

  return left <= posX && right > posX &&
    top <= posY && bottom > posY;
};

