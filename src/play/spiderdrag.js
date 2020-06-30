import AContainer from './acontainer';
import CDrag from './cdrag';

export default function SpiderDrag(play,
                                   ctx,
                                   bs) {

  let gspider = play.gspider;
  
  let dDrag = new CDrag(this, ctx, bs);

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dDrag);
  };
  initContainer();

  gspider.oBSelection.subscribe(({ cards }) => {
    dDrag.beginDrag(cards);
  });

  gspider.oASelection.subscribe(({
    active,
    activeEnding,
    epos,
    decay }) => {
      if (!active || activeEnding || !decay) {
        return;
      }
      dDrag.moveDrag(epos, decay);
    });

  gspider.fx('settle').subscribe({
    onBegin({ stackN }, resolve) {
      let dStack = play.dStackN(stackN);
      let settleTarget = 
          dStack.nextCardGlobalPosition();

      dDrag.beginSettle(settleTarget, resolve);
    },
    onEnd() {
      dDrag.endDrag();
    }
  });


  this.init = (data) => {
    
  };

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
