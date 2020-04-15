export const NbFutureTimes = 9;
export const RoomRows = 10;
export const RoomCols = 20;

const middleX = Math.floor(RoomCols / 2);
const middleY = Math.floor(RoomRows / 2);


export const Dirs = {
  left: {
    facing: 'left',
    v: [-1, 0]
  },
  right: {
    facing: 'right',
    v: [1, 0]
  },
  up: {
    facing: 'idle',
    v: [0, -1]
  },
  down: {
    facing: 'idle',
    v: [0, 1]
  }
};

export function pos2key(pos) {
  return pos[0] + '.' + pos[1];
};

export function key2pos(key) {
  return key.split('.').map(_ => parseInt(_));
}

export function Blueprint() {

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
        single([j, i], makeTile((i + j) % 2 === 0 ?Tiles.floor:Tiles.floor2));
      }
    }
  };

  const leftRight = () => {
    for (let i = 1; i < RoomRows - 1; i++) {
      if (i === middleY) {
        single([0, middleY], makeTile(Tiles.leftdoor));
        single([RoomCols - 1, middleY], makeTile(Tiles.rightdoor));

        single([0, middleY - 1], makeTile(Tiles.leftdoor));
        single([RoomCols - 1, middleY -1], makeTile(Tiles.rightdoor));
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
    type,
    collides: {
      crab: type !== Tiles.floor && type !== Tiles.floor2 && type !== Tiles.leftdoor && type !== Tiles.rightdoor,
      type
    }
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
  floor: 'floor',
  floor2: 'floor2'
};

