import * as v from './vec2';

import { Bus, never, later, fromEvent } from 'baconjs';

import * as Bacon from 'baconjs';

export default function Revents (canvas) {

  const dragMoveDistance = 20;
  const holdingPeriod = 600;

  let preventDefault = e => e.preventDefault();

  let starts = fromEvent(document, 'mousedown')
      .merge(fromEvent(document, 'touchstart'))
      .doAction(preventDefault),
      moves = fromEvent(document, 'mousemove')
      .merge(fromEvent(document, 'touchmove'))
      .doAction(preventDefault),
      ends = fromEvent(document, 'mouseup')
      .merge(fromEvent(document, 'touchend'))
      .doAction(preventDefault);

  starts = starts.map(e => {
    const pos = eventPosition(canvas, e);

    return {
      button: e.button,
      start: pos,
      epos: pos
    };
  });

  moves = moves.map(e => {
    return {
      epos: eventPosition(canvas, e)
    };
  });

  ends = ends.map(e => ({
    epos: eventPosition(canvas, e)
  }));

  let drags = starts.flatMap(startE => {
    let eRes = moves
      .skipWhile(moveE => {
          let { start } = startE;
        let { epos } = moveE;

        let dist = v.distance(start, epos);

        return dist < dragMoveDistance;
      })
      .takeUntil(ends)
      .map(moveE => {
        let dpos = v.csub(moveE.epos, startE.start);
        return {
          drags: true,
          dpos,
          ...startE,
          ...moveE };
      });

    return eRes.take(1)
      .map(_ => ({ initial: true, ..._ }))
      .merge(eRes.skip(1));
  });

  let drops = starts.flatMap(startE => {
    return ends.first().map(endE => ({ drops: true, 
                                       ...startE,
                                       ...endE }));
  });

  let clicks = starts.flatMap(startE => {
    return ends.first()
      .takeUntil(moves.skip(2).take(1))
      .takeUntil(later(holdingPeriod));
  });

  let holds = starts.flatMap(startE => {
    return later(holdingPeriod)
      .takeUntil(moves.skip(2).take(1))
      .takeUntil(ends)
      .map(startE);
  });

  let startsWithDpos = starts.flatMap(startE => {
    return moves
      .takeUntil(ends)
      .skip(2)
      .take(1)
      .map(dragE => {
        let dpos = v.csub(dragE.epos, startE.start);
        return {
          dpos
        };
      });
  });



  this.update = Bacon.update;
  this.when = Bacon.when;

  this.never = never();

  this.starts = starts;
  this.ends = ends;
  this.moves = moves;

  this.taps = clicks;
  this.clicks = clicks;
  this.holds = holds;
  this.drags = drags;
  this.drops = drops;
}

function EventSwitcher() {
  let bus = new Bus();

  let unplug = () => {};

  this.es = bus;

  this.switch = es => {
    unplug();
    unplug = bus.plug(es);
  };
};

const eventPositionDocument = e => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
  if (e.touches && e.targetTouches[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  if (e.changedTouches && e.changedTouches[0]) return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
  return undefined;
};

const eventPosition = (canvas, e) => {
  let edoc = eventPositionDocument(e);
  let { bounds } = canvas;

  return [edoc[0] - bounds.x,
          edoc[1] - bounds.y];
};
