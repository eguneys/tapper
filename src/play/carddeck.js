import Pool from 'poolf';
import AContainer from './acontainer';

import iPol from '../ipol';

import CardCard from './cardcard';

import { backCard } from '../cards';

export default function CardDeck(play, ctx, bs) {

  let pCards = new Pool(() => new CardCard(this, ctx, bs));

  let dCards = [];

  let container = this.container = new AContainer();
  const initContainer = () => {
    
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
