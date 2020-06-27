import AContainer from './acontainer';
import { text } from '../asprite';

export default function FippsText(play, ctx, bs) {

  let dText = text(bs.label, { 
    fontFamily: bs.fontFamily || 'fipps',
    fontSize: bs.size,
    fill: bs.fill || 0x000000,
    align: bs.align,
    wordWrap: bs.wordWrap,
    wordWrapWidth: bs.wordWrapWidth
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.c.addChild(dText);
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
