import { dContainer } from '../asprite';

export default function aContainer() {
  
  let components = [],
      container = this.c = dContainer();
  
  this.addChild = (component, opContainer = container) => {
    components.push(component);
    opContainer.addChild(component.container.c);
  };

  this.removeChild = (component, opContainer = container) => {
    components.splice(components.indexOf(component), 1);
    opContainer.removeChild(component.container.c);
  };

  this.vcenter = (height, yOffset = 0) => {
    let centerY = height * 0.5 - this.bounds().height * 0.5;
    this.moveY(centerY + yOffset);
  };

  this.hcenter = width => {
    let centerX = width * 0.5 - this.bounds().width * 0.5;
    this.moveX(centerX);
  };

  this.right = width => {
    let rightX = width - this.bounds().width;
    this.moveX(rightX);
  };

  this.center = (width, height, xOffset, yOffset) => {
    this.hcenter(width, xOffset);
    this.vcenter(height, yOffset);
  };

  let active = true;
  this.hideStopUpdate = () => {
    active = false;
    this.visible(false);
  };

  this.showStartUpdate = () => {
    active = true;
    this.visible(true);
  };

  this.bounds = () => container.getBounds();

  this.globalPosition = () => container.getGlobalPosition();

  this.move = (x, y) => {
    container.position.set(x, y);
  };

  this.moveX = x => {
    container.position.x = x;
  };

  this.moveY = (y) => {
    container.position.y = y;
  };

  this.moveX = (x) => {
    container.position.x = x;
  };

  this.alpha = (alpha) => container.alpha = alpha;

  this.scale = (x, y) => container.scale.set(x, y);

  this.pivot = (x, y) => container.pivot.set(x, y);

  this.visible = (visible) => container.visible = visible;

  this.mask = mask => container.mask = mask;

  this.update = (delta) => {
    if (!active) {
      return;
    }
    this.each(_ => _.update(delta));
  };

  this.render = () => {
    if (!active) {
      return;
    }
    this.each(_ => _.render());
  };

  this.each = (fn) => {
    components.forEach(fn);
  };

}
