import Storage from './storage';

export default function PlayStore() {
  
  let plays = {
    spider: new Storage('play.spider', null),
    solitaire: new Storage('play.solitaire', null),
    freecell: new Storage('play.freecell', null)
  };

  this.play = (key, value) => {
    if (value) {
      plays[key].apply(value);
    }

    return plays[key].apply();
  };
}
