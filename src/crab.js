import { Dirs } from './futureutil';

export default function Crab(future, bs) {

  let w = bs.tileSize.width,
      h = bs.tileSize.height;

  const States = [
    new Idle(this, future),
    new Walking(this, future),
    new Shooting(this, future)
  ];

  let dirtyState;
  let state;

  this.state = (key, data) => {
    if (key) {
      state = States.find(_ => _.key === key);
      state.init(data);
      dirtyState = true;
    }

    return state;
  };

  const updateState = (delta) => {
    if (dirtyState) {
      dirtyState = false;
      state.update(delta);
    }
  };


  let moves;

  let pos;
  let facing;

  this.facing = () => facing.facing;

  this.pos = () => pos;
  this.move = (dir) => {
    moves.push(dir);
  };

  this.shoot = () => {
    let x = pos[0] + facing.v[0],
        y = pos[1] + facing.v[1];
    future.shoot(x, y);
  };

  this.init = data => {
    pos = data.pos;
    moves = [];

    facing = Dirs.up;

    this.state('idle', {});
  };

  const collisionData = () => {
    let bounds = {
      x: pos[0] * w,
      y: pos[1] * h,
      w,
      h
    };
    return bounds;
  };

  const collides = () => {
    let collider = future.collider();
    let cdata = collisionData();
    return collider.collides(cdata);
  };

  const canMove = (cs) => {
    return !cs.some(({ crab }) => crab);
  };

  const findPickup = (cs) => {
    return cs.find(({ vision }) => vision);
  };

  const updateMoves = () => {

    moves.forEach(dir => {

      let { v } = dir;

      pos[0] += v[0];
      pos[1] += v[1];

      let cs = collides();
      let pickup =  findPickup(cs);
      if (pickup) {
        pickup.pickup = true;
      }

      if (!canMove(cs)) {
        pos[0] -= v[0];
        pos[1] -= v[1];
      }
      facing = dir;
    });

    moves = [];
  };

  this.update = (delta) => {
    updateMoves();
    state.update(delta);
    updateState(delta);
  };

}

function Idle(crab, future) {
  this.key = 'idle';

  this.init = () => {
  };

  this.update = (delta) => {
    let usermove = future.userMove();

    if (!usermove) {
      return;
    }

    let { up, left, right, down, space } = usermove;

    let dirs = [];

    if (up) {
      dirs.push(Dirs.up);
    } else if (down) {
      dirs.push(Dirs.down);
    }

    if (left) {
      dirs.push(Dirs.left);
    } else if (right) {
      dirs.push(Dirs.right);
    }

    if (space) {
      crab.state('shooting', {});
    }

    if (dirs.length > 0) {
      crab.state('walking', { dirs });
    }

  };
}

function Walking(crab, future) {
  this.key = 'walking';

  let dirs;

  let life;

  this.init = data => {
    life = 5;
    dirs = data.dirs;
  };

  const updateMove = () => {
    dirs.forEach(crab.move);
  };

  this.update = (delta) => {

    if (life === 4) {
      updateMove();
    }

    if (life-- < 0) {
      crab.state('idle', {});
    }
  };
}

function Shooting(crab, future) {
  this.key = 'shooting';
  
  let life;
  this.init = data => {
    life = 20;
  };

  this.update = (delta) => {

    if (life === 10) {
      crab.shoot();
    }

    if (life-- < 0) {
      crab.state('idle', {});
    }
  };

}
