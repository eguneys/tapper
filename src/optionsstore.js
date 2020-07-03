import * as ou from './optionutils';
import { objMap } from './util2';
import Storage from './storage';

export default function OptionsStore() {
  
  let showTutorial = {
    spider: new Storage('showTutorial.spider', true),
    solitaire: new Storage('showTutorial.solitaire', true),
    freecell: new Storage('showTutorial.freecell', true)
  };

  let solitaire = {
    cardsPerDraw: new Storage('solitaire.cardPerDraw',
                              ou.oneCard)
  };

  let spider = {
    
  };

  this.getOptions = () => {
    return {
      showTutorial: 
      objMap(showTutorial, (_, storage) => storage.boolean()),
      solitaire:
      objMap(solitaire, (_, storage) => storage.apply())
    };
  };

  this.solitaire = () => {
    return objMap(solitaire,
                  (_, storage) => 
                  storage.apply());
  };

  this.spider = () => {
    return objMap(spider,
                  (_, storage) => 
                  storage.apply());    
  };

  this.setSolitaireCardsPerDraw = (value) => {
    solitaire.cardsPerDraw.apply(value);
  };

  this.setShowTutorial = (key, value) => {
    showTutorial[key].boolean(value);
  };

}
