import iPol from '../ipol';
import { graphics } from '../asprite';
import AContainer from './acontainer';
import ASprite from './asprite';
import A9Slice from './a9slice';
import AVContainer from './avcontainer';

import { hitTest, moveHandler2 } from './util';

export default function VScrollList(play, ctx, bs) {

  const { textures } = ctx;

  const mhud = textures['mhud'];

  let { width, height, contents } = bs;

  let dBg = new A9Slice(this, ctx, {
    width,
    height,
    tileWidth: 16,
    textures: mhud['menubg9']
  });

  let vContents = new AVContainer(this, ctx, {
    contents,
    gap: height * 0.1
  });

  let barWidth = 16;
  let dScrollbar = new ASprite(this, ctx, {
    width: barWidth,
    texture: mhud['menubg']
  });

  let allHeight,
      viewHeight,
      maxScrollY;

  let mask = graphics();

  let container = this.container = new AContainer();
  const initContainer = () => {
    mask.beginFill(0xffffff);
    mask.drawRect(0, 0, width, height);
    mask.endFill();
    container.c.addChild(mask);
    container.mask(mask);

    container.addChild(dBg);
    dBg.container.alpha(0.2);

    container.addChild(vContents);

    container.addChild(dScrollbar);

    allHeight = vContents.container.bounds().height;
    viewHeight = dBg.container.bounds().height;

    let ratio = viewHeight / allHeight;

    dScrollbar.height(viewHeight * ratio);

    dScrollbar.move(width - barWidth,
                    0);

    maxScrollY = viewHeight - allHeight;

    if (maxScrollY >= 0) {
      dScrollbar.visible(false);
    } else {
      dScrollbar.visible(true);
    }
  };
  initContainer();

  this.init = (data) => {
    
  };

  let iScrollY = new iPol(0, 0, {});

  let bufferScrollY = 0,
      scrollY = 0;

  const scroll = y => {
    if (maxScrollY >= 0) {
      return;
    }

    bufferScrollY = y;
  };

  const commitScroll = () => {
    if (maxScrollY >= 0) {
      return;
    }

    scrollY += bufferScrollY;
    bufferScrollY = 0;

    if (scrollY > 0) {
      iScrollY.both(scrollY, 0);
    }

    if (scrollY < maxScrollY) {
      iScrollY.both(scrollY, maxScrollY);
    }
  };

  const updateScrollY = () => {
    if (!iScrollY.settled()) {
      let vScrollY = iScrollY.value();

      scrollY = vScrollY;
    }
  };

  let scrolling = false;

  const { events } = ctx;
  const handleMove = moveHandler2({
    onBegin(epos) {
      let bounds = dBg.container.bounds();
      let inBounds = hitTest(...epos, bounds);

      scrolling = inBounds;
    },
    onMove(epos, { dpos }) {
      if (scrolling) {
        scroll(dpos[1]);
      }
    },
    onEnd(epos) {
      if (scrolling) {
        commitScroll();
      }
    }
  }, events);

  this.update = delta => {
    handleMove(delta);

    iScrollY.update(delta / 200);

    updateScrollY();

    this.container.update(delta);
  };

  this.render = () => {

    let contentsY = bufferScrollY + scrollY;

    vContents.container.moveY(contentsY);


    const ratioY = -1 * contentsY / allHeight;

    let barY = viewHeight * ratioY;
    dScrollbar.y(barY);

    this.container.render();
  };
}
