import { readStack,
         writeStack } from './fen';

export const isN = n => (n || n === 0) && !(n < 0);


export function CardStack(hidden = [], 
                          front = []) {

  let inProgress;

  let options = this.options = {};

  this.front = front;
  this.hidden = hidden;

  this.inProgress = () => inProgress;

  this.cutLast = () => front.pop();

  this.cut1 = n => front.splice(n, front.length - n);

  this.cutInProgress = n => {
    inProgress = true;
    return this.cut1(n);
  };

  this.cutInProgressCommit = () => {
    inProgress = false;
  };

  this.hide1 = cards => {
    cards.forEach(_ => hidden.push(_));
  };

  this.add1 = cards => {
    cards.forEach(_ => front.push(_));
  };

  this.clear = () => {
    front = this.front = [];
    hidden = this.hidden = [];
  };

  this.reveal1 = () => {
    return hidden.pop();
  };

  this.unreveal1 = () => {
    options.dontExtend = true;
    front.pop();
  };

  this.unreveal2 = (card) => {
    options.dontExtend = false;
    hidden.push(card);
  };

  const top = () => front[front.length - 1];

  this.topCard = () => top();

  this.canReveal = () => front.length === 0 && hidden.length > 0;


  this.write = () => {
    let eFront = writeStack(this.front);
    let eHidden = writeStack(this.hidden);

    return `${eFront};${eHidden}`;
  };

  this.read = (e) => {
    let [eFront, eHidden] = e.split(';');

    front = this.front = readStack(eFront);
    hidden = this.hidden = readStack(eHidden);
  };

}
