import { objMap } from './util2';
import Storage from './storage';

export default function OptionsStore() {
  
  let showTutorial = {
    spider: new Storage('showTutorial.spider', true),
    solitaire: new Storage('showTutorial.solitaire', true),
    freecell: new Storage('showTutorial.freecell', true)
  };

  this.getOptions = () => {
    return {
      showTutorial: 
      objMap(showTutorial, (_, storage) => storage.boolean())
    };
  };

  this.setShowTutorial = (key, value) => {
    showTutorial[key].boolean(value);
  };

}
