import { rect } from '../dquad/geometry';
import { dContainer, sprite } from '../asprite';

import FutureGame from './futuregame';
import { NbFutureTimes, RoomRows, RoomCols } from '../futureutil';


export default function Play(ctx) {

  const { textures, canvas } = ctx;

  let bs = (() => {
    let { width, height } = canvas;

    let margin = width * 0.01;

    let timelineEntries = NbFutureTimes;

    let timelineW = width * 0.8,
        timelineH = timelineW / timelineEntries;

    let timeline = rect((width - timelineW) * 0.5, 
                        margin,
                        timelineW,
                        timelineH);


    let roomHeight = height;
    let roomWidth = width;

    let tileSizeW = roomWidth / RoomCols;
    let tileSizeH = roomHeight / RoomRows;

    let tileSize = rect(0, 0, tileSizeW, tileSizeH);

    let room = rect(0,
                    0,
                    roomWidth,
                    roomHeight);

    return {
      tileSize,
      timeline,
      room,
      width,
      height
    };
  })();

  let futureGame = new FutureGame(this, ctx, bs);

  let components = [];
  let container = dContainer();

  const initContainer = () => {
    futureGame.add(container);
    components.push(futureGame);
  };
  initContainer();

  this.init = data => {
    
    futureGame.init({});

  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.update = delta => {
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

}
