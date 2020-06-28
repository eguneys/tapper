import * as mu from 'mutilz';
import Pool from 'poolf';
import AContainer from './acontainer';
import CardTrailEffect from './cardtraileffect';

export default function SoliHoller(play, ctx, bs) {

  let gsolitaire = play.gsolitaire;

  let dCards = new Pool(() => new CardTrailEffect(this, ctx, bs));

  let container = this.container = new AContainer();
  const initContainer = () => {};
  initContainer();

  this.init = (data) => {
    
  };

  [0, 1, 2, 3].forEach(holeN => {
    gsolitaire.holeEndN(holeN).subscribe(card => {

      let gp = play.dHoleN(holeN).nextCardGlobalPosition();

      let randomLeftSidePos = [
        mu.randInt(0, bs.width * 0.5),
        mu.randInt(0, bs.height - bs.card.height)
      ];

      let dCard = dCards.acquire(_ => _.init({
        card,
        orig: gp,
        dest: randomLeftSidePos
      }));

      container.addChild(dCard);
    });
  });

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
