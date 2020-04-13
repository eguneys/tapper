import Pool from 'poolf';
import { dContainer } from '../asprite';

export default function FutureRoom(play, ctx, bs) {

  let tiles = new Pool(() => RoomTile(this, ctx, {
    width: bs.tileSize.width,
    height: bs.tileSize.height
  }));

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  this.init = data => {
  };

  this.move = (x, y) => {
    container.position.set(x, y);
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

function RoomTile(play, ctx) {

  let components = [];
  const container = dContainer();
  const initContainer = () => {
  };
  initContainer();

  this.init = data => {
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.move = (x, y) => {
    container.position.set(x, y);
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
