export default function SolitaireAi(cardGame, solitaire) {
  
  let inContext;

  this.userActionStart = () => {
    inContext = true;
  };

  this.userActionStop = () => {
    inContext = false;
  };

  cardGame.ai.subscribe(ai => {
    if (!inContext) {
      return;
    }

    let { play } = ai;

    if (play === 'play') {
      console.log('playing');
    }
  });
  
}
