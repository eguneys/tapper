import { withDelay } from './util';

export default function TapMorphy(tapper) {

  const States = [
    new Sleeping(this, tapper),
    new Idle(this, tapper)
  ];

  let pos;

  let state;

  this.pos = () => pos;

  this.state = key => {
    if (key) {
      state = States.find(_ => _.key === key);
    }
    return state;
  };

  this.init = (data) => {
    pos = data.pos;

    this.state('sleeping');
  };

  this.update = (delta) => {
    state.update(delta);
  };

}

function Sleeping(morphy, tapper) {

  this.key = 'sleeping';

  this.update = (delta) => {
    let taps = tapper.taps();

    if (taps > 10) {
      morphy.state('idle');
    }
  };
}

function Idle(morphy, tapper) {

  this.key = 'idle';

  const maybeUntap = withDelay(() => {
    let pos = morphy.pos();
    tapper.untap('idle', pos.x, pos.y);
  }, 1000, {});

  this.update = (delta) => {
    let taps = tapper.taps();
    if (taps <= 0) {
      morphy.state('sleeping');
    }
    maybeUntap(16 / delta);
  };
}
