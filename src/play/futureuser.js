import { dContainer } from '../asprite';

export default function FutureUser(play, ctx) {

  const { keyboard } = ctx;

  this.init = data => {
  };

  const handleKeyboard = () => {
    let { up, down, left, right } = keyboard.data;
  };

  this.update = delta => {

    handleKeyboard();

  };

}
