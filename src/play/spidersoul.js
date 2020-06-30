import AContainer from './acontainer';
import CardSoul from './cardsoul';

export default function SpiderSoul(play, ctx, bs) {

  let cardGame = play.cardGame;
  let gspider = play.gspider;
  
  let dSoul = new CardSoul(this, ctx, {
    onDragStart(epos) {
      let orig = play.getHitKeyForEpos(epos);
      gspider.userActionDragStart({
        epos,
        ...orig
      });
    },
    onDragMove(epos) {
      gspider.userActionDragMove(epos);
    },
    onDragEnd(epos) {
      let dest = play.getHitKeyForEpos(epos);
      gspider.userActionDragEnd({
        epos,
        ...dest
      });
    }
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dSoul);
  };
  initContainer();

  this.init = (data) => {
    
  };

  cardGame.oHamburger.subscribe(({ open }) => {
    dSoul.dontHandleMoves(open);
  });

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
