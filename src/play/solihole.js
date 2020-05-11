import { dContainer } from '../asprite';

import TapSprite from './tapsprite';
import CandyCardPlace from './candycardplace';
import CandyCards from './candycards';

import { fxHandler } from './util';

export default function SoliHole(play, ctx, bs) {

  const { textures } = ctx;

  let mcards = textures['mcards'];

  let cWidth = bs.card.width,
      cHeight = bs.card.height;

  let solitaire;
  let n;

  let dHighlight = new TapSprite(this, ctx, {
    width: cWidth + 2,
    height: cHeight + 2,
    texture: mcards['highlight']
  });

  let dPlaceholder = new CandyCardPlace(this, ctx, {
    onEndCard() {
      solitaire.endSelectHole(n);
    },
    ...bs
  });

  let dTopcard = new CandyCards(this, ctx, bs);

  let components = [];
  const container = dContainer();
  const initContainer = () => {
    dPlaceholder.add(container);
    components.push(dPlaceholder);

    dTopcard.add(container);
    components.push(dTopcard);

    dHighlight.move(-1, -1);
    dHighlight.add(container);
    components.push(dHighlight);
  };
  initContainer();

  this.init = data => {
    solitaire = data.solitaire;
    n = data.i;

    this.refresh();

    dPlaceholder.init({});
  };

  const refresh = this.refresh = () => {
    let hole = solitaire.hole(n);
    let top = hole.top();
    if (top) {
      dHighlight.visible(false);
      dTopcard.visible(true);
      dTopcard.init(top);
    } else {
      dHighlight.visible(true);
      dTopcard.visible(false);
    }
  };


  let shouldHandleAdd;
  const handleAdd = fxHandler({
    allowEnd: true,
    duration: 500,
    onBegin({ dstHole, card }) {
      shouldHandleAdd = dstHole === n;

      if (!shouldHandleAdd) {
        return;
      }

      dTopcard.visible(true);
      dTopcard.init(card);
    },
    onUpdate(_, i) {
      if (!shouldHandleAdd) {
        return;
      }

      

    },
    onEnd() {
      if (!shouldHandleAdd) {
        return;
      }
      refresh();
    }
  }, () => solitaire.data.addhole);

  this.update = delta => {
    handleAdd(delta);
    components.forEach(_ => _.update(delta));
  };

  this.render = () => {
    components.forEach(_ => _.render());
  };

  this.add = (parent) => {
    parent.addChild(container);
  };

  this.remove = () => {
    container.parent.removeChild(container);
  };

  this.move = (x, y) => container.position.set(x, y);

  this.globalPosition = () => container.getGlobalPosition();
}
