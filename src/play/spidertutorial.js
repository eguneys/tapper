import AContainer from './acontainer';
import ATutorial from './atutorial';
import AFadingContent from './afadingcontent';

export default function SpiderTutorial(play, ctx, bs) {

  const textHeader = `How to Play`;

  const text1 = `In Spider, the goal is to remove all the cards from the table by creating "runs" of cards. Each run needs to be organized in descending order from King to Ace.`;

  const text2 = `In games with more than one suit, runs need to be of the same suit to be considered complete. Completed runs are automatically removed from the table for you.`;

  const text3 = `In Spider, kings are high, and aces are low. You can build runs by moving cards between columns as long as they stack in the proper sequence (King, Queen, Jack, 10, 9, 8, 7, 6, 5, 4, 3, 2, Ace).`;

  const text4 = `In games with more than one suit, you can mix different suits within the same card sequence. Just remember a run has to be entirely of the same suit to be able to move or be removed from the table.`;

  const text5 = `If you ever have an empty column, you can place any card or sequential stack there. There is no limit as to how many cards you can move at once.`;

  const text6 = `If you run out of moves, tap one of the stockpiles in the lower-left corner to deal a new row of cards. But be careful - you can't deal a new row while any columns are empty.`;

  let gspider = play.gspider;
  let cardGame = play.cardGame;

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
    onClose() {
      fadeIn(false);
    },
    onDontShow() {
      cardGame.userActionOptionShowTutorialCheck('spider');
    },
    ...bs
  });

  let dFadingTut = new AFadingContent(this, ctx, {
    content: dTutorial
  });

  const fadeIn = (fadeIn) => {
    if (fadeIn) {
      dTutorial.init();
    }
    dFadingTut.fadeIn(fadeIn);
  };

  let container = this.container = new AContainer();
  const initContainer = () => {
    container.addChild(dFadingTut);
  };
  initContainer();

  gspider.oShowTutorial.subscribe(_ => {
    fadeIn(true);
  });

  cardGame
    .oOptions
    .showTutorial['spider']
    .subscribe(_ => dTutorial.setDontShow(!_));

  this.init = (data) => {};

  this.update = delta => {
    this.container.update(delta);
  };

  this.render = () => {
    this.container.render();
  };
}
