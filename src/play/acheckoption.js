import AContainer from './acontainer';
import ACheckbox from './acheckbox';
import Fipps from './fippstext';
import AHContainer from './ahcontainer';

export default function Play(play, ctx, bs) {

  let dO = new ACheckbox(this, ctx, {
    width: bs.width,
    height: bs.height,
    onCheck: bs.onCheck
  });

  let dLabel = new Fipps(this, ctx, {
    label: bs.label,
    size: bs.width * 0.2
  });

  let dBoth = new AHContainer(this, ctx, {
    contents: [
      dO,
      dLabel
    ],
    gap: bs.width * 0.1
  });

  this.dO = dO;

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBoth);
  };
  initContainer();

  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
