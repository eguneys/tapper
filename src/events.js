import * as v from './vec2';

const { vec2 } = v;

export default function Events(canvas) {

  let state = this.data = {
    touches: {}
  };

  this.update = delta => {
    let { current, wheel } = state;

    if (wheel) {
      if (wheel.handled) {
        delete state.wheel;
      } else {
        wheel.handled = true;
      }
    }

    if (current) {
      current.dpos = v.csub(current.epos, current.start);
      if (current.tapping) {
        if (current.tapping.handled) {
          delete current.tapping;
        } else {
          current.tapping.handled = true;
        }
      }
      if (current.ending) {
        if (current.ending.handled) {
          delete state.current;
        } else {
          current.ending.handled = true;
        }
      }
    }

  };  

  this.bindTouch = () => bindTouch(this.data);
 
  function bindTouch(state) {
    const unbinds = [];

    const onTouchStart = startTouch(state);
    const onTouchEnd = endTouch(state);
    const onTouchMove = moveTouch(state);

    const onWheel = moveWheel(state);

    ['mousedown', 'touchstart'].forEach(_ => 
      unbinds.push(unbindable(document, _, onTouchStart)));

    ['mousemove', 'touchmove'].forEach(_ => 
      unbinds.push(unbindable(document, _, onTouchMove)));

    ['mouseup', 'touchend'].forEach(_ =>
      unbinds.push(unbindable(document, _, onTouchEnd)));

    unbinds.push(unbindable(document, 'wheel', onWheel));

    const onScroll = () => canvas.fBounds.clear();
    unbinds.push(unbindable(document, 'scroll', onScroll));

    return () => { unbinds.forEach(_ => _()); };
  };

  function unbindable(el, eventName, callback) {
    el.addEventListener(eventName, callback);
    return () => el.removeEventListener(eventName, callback);
  }

  const moveWheel = (state) => {
    return (e) => {
      state.wheel = { 
        epos: eventPosition(e),
        y: Math.sign(e.deltaY) 
      };
    };
  };

  const eventPositionDocument = e => {
    if (e.clientX || e.clientX === 0) 
      return [e.clientX, e.clientY];
    if (e.touches && e.targetTouches[0]) 
      return [e.targetTouches[0].clientX, 
              e.targetTouches[0].clientY];
    return undefined;
  };

  const eventPosition = e => {
    let edoc = eventPositionDocument(e);
    let { fBounds } = canvas;

    let bounds = fBounds();

    return [edoc[0] - bounds.x,
            edoc[1] - bounds.y];
  };

  function startTouch(state) {
    return function(e) {
      e.preventDefault();
      const tPos = eventPosition(e);
      state.current = {
        button: e.button,
        tapping: {},
        start: tPos,
        epos: tPos,
        dpos: vec2(0)
      };
    };
  }

  function moveTouch(state) {
    return function(e) {
      const tPos = eventPosition(e);
      if (state.current) {
        state.current.epos = tPos;
      }
      state.epos = tPos;
    };
  }

  const swipePosition = pos => {
    let res = {
      
    };
    let threshold = 80;

    if (pos[1] < -threshold) {
      res.up = true;
    } else if (pos[1] > threshold) {
      res.down = true;
    }
    if (pos[0] < -threshold) {
      res.left = true;
    } else if (pos[0] > threshold) {
      res.right = true;
    }

    if (res.up || res.down || res.left || res.right) {
      res.swiped = true;
    }

    return res;
  };

  function endTouch(state) {
    return function(e) {
      if (state.current) {
        let { dpos } = state.current;

        let swipe = swipePosition(dpos);

        state.current.ending = {
          swipe
        };
      }
    };
  }

 
}
