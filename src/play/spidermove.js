import AContainer from './acontainer';
import CMove from './cmove';

export default function Play(play, ctx, bs) {

  let gspider = play.gspider;

  let dMove = new CMove(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dMove);
  };
  initContainer();

  gspider.fx('move').subscribe({
    onBegin(oMove, resolve) {
      let { cards,
            srcStackN,
            dstStackN } = oMove;

      let dSrc = play.dStackN(srcStackN),
          dDst = play.dStackN(dstStackN);

      let settleSource = dSrc
          .nextCardGlobalPosition(),
          settleTarget = dDst
          .nextCardGlobalPosition();

      dMove.beginMove({
        settleSource,
        settleTarget,
        cards
      }, resolve);
    },
    onEnd() {
      dMove.endMove();
    }
  });  

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
