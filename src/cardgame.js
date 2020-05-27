export default function CardGame() {

  let data = this.data = {
    view: 'menu'
  };

  this.view = view => {
    data.view = view;
  };

}
