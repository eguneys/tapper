import AContainer from './acontainer';
import A9Slice from './a9slice';
import Fipps from './fippstext';
import AChangingContent from './achangingcontent';
import AChangingButtons from './achangingbuttons';
import APageText from './apagetext';
import ACheckOption from './acheckoption';

import { callMaybe } from './util';

export default function ATutorial(play, ctx, bs) {

  const { textures } = ctx;
  const mhud = textures['mhud'];

  let { contents } = bs;

  let contentWidth = bs.tutorial.width - bs.uiMargin * 2.0;

  let dBg = new A9Slice(this, ctx, {
    width: bs.tutorial.width,
    height: bs.tutorial.height,
    tileWidth: 32,
    textures: mhud['menubg9']
  });

  let dHeader = new Fipps(this, ctx, {
    label: bs.header,
    size: bs.text.h1,
    fontFamily: 'Roboto',
    fill: 0xffffff
  });

  let dontShowHeight = bs.tutorial.height * 0.1;
  let dDontShow = new ACheckOption(this, ctx, {
    fontFamily: 'Roboto',
    fill: 0xffffff,
    size: dontShowHeight * 0.6,
    label: "Don't show again",
    width: bs.tutorial.width * 0.1,
    height: dontShowHeight,
    onCheck() {
      callMaybe(bs.onDontShow);
    }
  });

  let dContents = contents.map(_ => new Fipps(this, ctx, {
    label: _,
    size: bs.text.p,
    fill: 0xffffff,
    fontFamily: 'Roboto',
    wordWrap: true,
    wordWrapWidth: contentWidth
  }));

  let dPageText = new APageText(this, ctx, {
    size: bs.text.p,
    total: dContents.length
  });


  let buttonsHeight = bs.height * 0.14;
  let dButtons = new AChangingButtons(this, ctx, {
    width: bs.tutorial.width - bs.uiMargin * 2.0,
    height: buttonsHeight,
    onClose() {
      callMaybe(bs.onClose);
    },
    onNext() {
      dBody.next();
    },
    onBack() {
      dBody.back();
    }
  });

  const placeButtons = (dBody) => {
    let canNext = dBody.canNext();
    let canBack = dBody.canBack();

    let back = canBack,
        next = canNext,
        play = !canNext,
        close = !play;

    dButtons.placeButtons({
      back, next, play, close
    });
  };

  const onContentChanged = (i, dBody) => {
    dPageText.page(i + 1);
    placeButtons(dBody);
  };

  let dBody = new AChangingContent(this, ctx, {
    contents: dContents,
    onContentChanged
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);

    container.addChild(dDontShow);
    container.addChild(dPageText);
    container.addChild(dHeader);
    container.addChild(dBody);
    container.addChild(dButtons);

    dButtons.container.move(bs.uiMargin,
                            bs.tutorial.height - 
                            buttonsHeight -
                            bs.uiMargin);

    
    dDontShow.container.move(bs.uiMargin,
                             bs.tutorial.height -
                             buttonsHeight -
                             dontShowHeight -
                             bs.uiMargin * 2.0);

    let pageTextBounds = dPageText.container.bounds();
    dPageText.container
      .move(bs.tutorial.width - 
            pageTextBounds.width * 0.5 -
            bs.uiMargin, 
            bs.uiMargin);

    dHeader.container.move(bs.uiMargin, bs.uiMargin);
    let headerBounds = dHeader.container.bounds();
    dBody.container.move(bs.uiMargin,
                         bs.uiMargin + headerBounds.bottom);
  };
  initContainer();

  this.setDontShow = (value) => {
    dDontShow.dO.smoothcheck(value);
  };

  this.init = (data) => {
    dBody.first();
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
