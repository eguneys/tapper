export default function GEvents(canvas) {

  const startTouch = () => {
    return function(e) {
      e.preventDefault();
      const tPos = eventPosition(e);
    };
  };

  this.bindTouch = () => bindTouch();

  const eventPositionDocument = e => {
    if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
    if (e.touches && e.targetTouches[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return undefined;
  };

  const eventPosition = e => {
    let edoc = eventPositionDocument(e);
    let { bounds } = canvas;

    return [edoc[0] - bounds.x,
            edoc[1] - bounds.y];
  };

  function bindTouch() {
    const unbinds = [];

    const onTouchStart = startTouch();
    const onTouchEnd = endTouch();
    const onTouchMove = moveTouch();

    const onWheel = moveWheel();

    ['mousedown', 'touchstart'].forEach(_ => 
      unbinds.push(unbindable(document, _, onTouchStart)));

    ['mousemove', 'touchmove'].forEach(_ => 
      unbinds.push(unbindable(document, _, onTouchMove)));

    ['mouseup', 'touchend'].forEach(_ =>
      unbinds.push(unbindable(document, _, onTouchEnd)));

    unbinds.push(unbindable(document, 'wheel', onWheel));

    return () => { unbinds.forEach(_ => _()); };
  };

  function unbindable(el, eventName, callback) {
    el.addEventListener(eventName, callback);
    return () => el.removeEventListener(eventName, callback);
  }

}
