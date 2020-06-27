import AContainer from './acontainer';
import ATutorial from './atutorial';

export default function SoliTutorial(play, ctx, bs) {

  const textHeader = `How to Play`;

  const text1 = `The goal of Solitaire is to create a stack of cards from low to high in each of the four foundation piles. Each pile can contain only one suit.`;

  const text2 = `In Solitaire, aces are low and kings are high. The four foundation piles must begin with aces and end with kings.`;

  const text3 = `Near the foundation piles, you can move cards from one column to another. Cards in columns must be placed in descending order and must alternate red and black. For example, you can put a red 6 on a black 7`;

  const text4 = `You can also move sequential runs of cards between columns. Just tap the deepest card in the run and drag them all to another column.`;

  const text5 = `If you ever have an empty column, you can place a King there or any sequential stack with a King at its head.`;

  const text6 = `If you get stuck, tap the deck in the upper-left corner to draw more cards. You can deal it again by tapping the red O icon. You can double tap on a card to automatically place it in a hole.`;

  let dTutorial = new ATutorial(this, ctx, {
    header: textHeader,
    contents: [
      text1,
      text2,
      text3,
      text4,
      text5,
      text6
    ],
    ...bs
  });

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dTutorial);
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
