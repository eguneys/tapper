import * as Bacon from 'baconjs';

import { makeOneDeck } from './deck';
import { isN, SoliStack, SoliHole, SoliDrawDeck } from './soliutils';

import RSoliDealer from './rsolidealer';

export default function RSolitaire() {

  let deck = makeOneDeck();

  let pStacks = [
    StackProperty(),
    StackProperty(),
    StackProperty(),
    StackProperty(),
    StackProperty(),
    StackProperty(),
    StackProperty()
  ];

  const esDealer = RSoliDealer();


  let esInit = this.userInits = new Bacon.Bus();
  let esDragsStackToStack = this.userDragsStackToStack = new Bacon.Bus();
  
  let esDrawerDealOne = esInit.flatMapLatest(_ => {
    return esDealer;
  });
  let esDrawerInit = this.userInits.map(_ => deck.drawRest());

  let esDrawer = {
    init: esDrawerInit,
    dealOne: esDrawerDealOne
  };
  let pDrawer = DrawerProperty(esDrawer);

  this.pStackN = n => pStacks[n];

}

function DrawerProperty({
  init,
  dealOne
}) {
  return Bacon.update(new SoliDrawDeck(),
                      [init, (_, cards) => _.init(cards)],
                      [dealOne, (_) => _.dealOne1()]);
}

function StackProperty() {
  return Bacon.constant(new SoliStack());
}

function testing() {

  let userInit = Bacon.interval(2000, true);

  let deal = Bacon.repeatedly(1000, [1,2,3]);
  let dealI = Bacon.interval(4000, true);

  let drawerAdd = userInit.flatMapLatest(_ => 
    deal
      .zip(dealI, _ => _)
  );

  drawerAdd.log();
}

// testing();
