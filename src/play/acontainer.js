import { dContainer } from '../asprite';

export default function aContainer() {
  
  let components = [],
      container = this.c = dContainer();
  
  this.addChild = (component) => {
    components.push(component);
    container.addChild(component.container.c);
  };

  this.removeChild = (component) => {
    components.splice(components.indexOf(component), 1);
    container.removeChild(component.container.c);
  };

  this.bounds = () => container.getBounds();

  this.globalPosition = () => container.getGlobalPosition();

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.scale = (x, y) => container.scale.set(x, y);

  this.pivot = (x, y) => container.pivot.set(x, y);

  this.visible = (visible) => container.visible = visible;

  this.update = (delta) => {
    this.each(_ => _.update(delta));
  };

  this.render = () => {
    this.each(_ => _.render());
  };

  this.each = (fn) => {
    components.forEach(fn);
  };

}
