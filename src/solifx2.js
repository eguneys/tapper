export function SoliFxDealDeck(solitaire) {
  
  let sData = solitaire.data;

  let data = this.data = {
  };

  this.doBegin = (stackN, isHidden) => {
    data.stackN = stackN;
    data.isHidden = isHidden;

    data.cards = [sData.drawStack.dealDraw1()];
  };

  this.doEnd = () => {
    let stack = sData.stacks[data.stackN];
    if (data.isHidden) {
      stack.hide1(data.cards);
    } else {
      stack.add1(data.cards);
    }
  };

}

export function SoliFxUndoDealDeck(solitaire) {
  
  let sData = solitaire.data;

  let data = this.data = {
  };

  this.doBegin = (stackN) => {
    data.stackN = stackN;

    data.cards = [sData.stacks[stackN].remove1()];
  };

  this.doEnd = () => {
    sData.drawStack.undoDraw(data.cards);
  };

}
