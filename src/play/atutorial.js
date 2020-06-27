import AContainer from './acontainer';
import A9Slice from './a9slice';
import Fipps from './fippstext';
import AChangingContent from './achangingcontent';
import AVContainer from './avcontainer';
import APageText from './apagetext';

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

  let dContents = contents.map(_ => new Fipps(this, ctx, {
    label: _,
    size: bs.text.p,
    fill: 0xffffff,
    fontFamily: 'Roboto',
    wordWrap: true,
    wordWrapWidth: contentWidth
  }));

  let dBody = new AChangingContent(this, ctx, {
    contents: dContents
  });

  let dPageText = new APageText(this, ctx, {
    page: dBody.contentIndex() + 1,
    total: dContents.length
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dBg);

    container.addChild(dPageText);
    container.addChild(dHeader);
    container.addChild(dBody);

    let pageTextBounds = dPageText.container.bounds();
    dPageText.container
      .move(bs.tutorial.width - 
            pageTextBounds.width -
            bs.uiMargin, 
            bs.uiMargin);

    dHeader.container.move(bs.uiMargin, 0);
    let headerHeight = dHeader.container.bounds().height;
    dBody.container.move(bs.uiMargin,
                         bs.uiMargin + headerHeight);
  };
  initContainer();

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
