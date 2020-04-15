import { dContainer } from '../asprite';

export default function FutureUser(play, ctx) {

  const { keyboard } = ctx;

  let future;
  this.init = data => {
    future = data.future;
  };

  const handleKeyboard = () => {
    let dirs = keyboard.data;

    future.userMove(dirs);    
  };

  this.update = delta => {

    handleKeyboard();

  };

}
