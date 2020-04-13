export const NbFutureTimes = 9;
export const RoomRows = 10;
export const RoomCols = 20;

export default function Future() {

  let state = {};
  let tiles = this.tiles = Blueprint();

  this.state = () => state;

  this.init = (data) => {
    state.time = data.time;
    state.vision = data.vision;
  };

  const travelPast = () => {
    if (state.time === 0) {
      return;
    }
    state.time = state.time - 1;
  };

  const travelFuture = () => {
    if (state.time === NbFutureTimes - 1) {
      return;
    }
    state.time = state.time + 1;
  };

  const visionUp = () => {
    state.vision++;
  };

  const visionDown = () => {
    state.vision--;
  };

  this.update = delta => {

    

  };

}

export function pos2key(pos) {
  return pos[0] + '.' + pos[1];
};

export function key2pos(key) {
  return key.split('.').map(_ => parseInt(_));
}

function Blueprint() {

  const tiles = {};

  const topLeftPos = [0, 0],
        topRightPos = [RoomCols - 1, 0],
        bottomLeftPos = [0, RoomRows - 1],
        bottomRightPos = [RoomCols - 1, RoomRows - 1];


  
  const topBottom = () => {
    for (let i = 1; i < RoomCols - 1; i++) {
      single([i, 0], makeTile(Tiles.top));
      single([i, RoomRows - 1], makeTile(Tiles.bottom));
    }
  };
  
  const middle = () => {
    for (let i = 1; i < RoomRows - 1; i++) {
      for (let j = 1; j < RoomCols - 1; j++) {
        single([j, i], makeTile(Tiles.floor));
      }
    }
  };

  const leftRight = () => {
    let middleY = Math.floor(RoomRows / 2);

    for (let i = 1; i < RoomRows - 1; i++) {
      if (i === middleY) {
        single([0, middleY], makeTile(Tiles.leftdoor));
        single([RoomCols - 1, middleY], makeTile(Tiles.rightdoor));
      } else {
        single([0, i], makeTile(Tiles.left));
        single([RoomCols - 1, i], makeTile(Tiles.right));
      }
    }
  };

  const single = (pos, tile) => {
    let key = pos2key(pos);
    tiles[key] = tile;
  };

  single(topLeftPos, makeTile(Tiles.topleft));
  single(topRightPos, makeTile(Tiles.topright));
  leftRight();
  middle();
  topBottom();
  single(bottomLeftPos, makeTile(Tiles.bottomleft));
  single(bottomRightPos, makeTile(Tiles.bottomright));

  return tiles;  
}

const makeTile = (type) => {
  return {
    type
  };
};

export const Tiles = {
  topleft: 'topleft',
  topright: 'topright',
  bottomleft: 'bottomleft',
  bottomright: 'bottomright',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  leftdoor: 'leftdoor',
  rightdoor: 'rightdoor',
  floor: 'floor'
};
