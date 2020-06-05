# Card Game Issues

- [ ] Menu bar
  -  [ ] menu button
  -  [ ] back button in game view brings into main menu
- [ ] Main menu
   - [ ] game selection
   - [ ] Settings
    
# Solitaire Issues

- [ ] Undo
   - [ ] undo card deal
   - [ ] undo stack stack move
   - [ ] undo draw stack move
   - [ ] undo stack hole move
   - [ ] undo hole stack move
- [ ] Cards move according to rules
- [ ] User drags / moves stack to hole
- [ ] User drags / moves hole to stack
- [x] User select deck to show draw cards
- [x] User drags draw cards
- [+] User selects a card stack highlights
  - [ ] selecting a card stack highlights cards up to highest stack
  - [x] selecting a card  again highlights up to selected card
- [x] User selects a card then selects another card to move it.
- [x] User drags a card stack
- [x] User drops on card stack
  - [x] User drops on empty card stack
  - [x] empty stack reveals new card

# User actions

* User taps on source, user releases
* User taps on source, moves on blank, releases
* User taps on source, moves on target, releases

    userActionBeginTap(source, tapData)
    userActionMoveTap(tapData)
    userActionRelaseOnTarget(target)
    userActionRelease()

# Solitaire

    async actionDealCards() {
        dealer.init();
        await actionDealCardsStep();
    }


    async actionDealCardsStep() {
      let res = dealer.acquireDeal();
 
      if (!res) {
          Promise.resolve();
      } else {
          await actionDealCard(res)
          actionDealCardsStep();
      }
    }

    actionDealCard(oDeal) {
        fx('deal').begin(oDeal);
    }


    actionSelectStack() {

      let { stackN, cardN } = await userSelectsStack()

      let ps = persistSelect();

      if (ps) {

        let { stackN: srcStackN, cardN: srcCardN, cards } = ps;

        let dstStack = stack(stackN),
            srcStack = stack(srcStackN);

        if (srcStack === dstStack) {
        } else {
          effectEndPersistSelect();
          return await actionMoveCards(srcStackN, stackN, srcCardN);
        }
      }

      if (!canSelectStack(stackN, cardN)) {
          return Promise.reject();
      }

      let cards = effectStackCut1(stackN, cardN);

      effectBeginSelect(cards);

      let target = await userEndsSelect();

      let { stackN: dstStackN, holeN: dstHoleN } = target;

      if (dstStackN && canAddStack(dstStackN)) {
          return await actionSettleStack(stackN, dstStackN, cards);
      } else if (dstHoleN && canAddHole(dstHoleN)) {
          return await actionSettleHole(dstHoleN, cards);
      } else {
          return await actionSettleStackCancel(stackN, cards);
      }
    }

    


    actionMoveCards(srcStackN, dstStackN, srcCardN) {
      let cards = effectStackCut1(srcStackN, srcCardN);

      let pReveal = actionRevealStack(srcStackN);
      let pMove = fx('move').begin({ srcStackN,
          dstStackN,
          cards
      });

      return Promise.all([pReveal, pMove]);
    }

    actionRevealStack = (stackN) => {
      let canReveal = stack(stackN)
          .apply(_ => _.canReveal());

      if (!canReveal) {
          return Promise.reject();
      }

      let last = stack(stackN).mutate(_ => _.reveal1());
      return 
          fx('reveal').begin({ n: stackN,
              card: last });
    }

    effectStackCut1(stackN, cardN) {
        return stack(stackN).mutate(_ => 
            return _.cut1(cardN);
        );
    }

    let data = {
        stacks: [
            observable(new SoliStack(0)),
            observable(new SoliStack(1))
        ],
        fx: {
            'reveal': new PromiseObservable(),
            'move': new PromiseObservable()
        }
    };

    stack(stackN) {
        return data.stcks[stackN];
    }

    fx(name) {
        return data.fx[name];
    }
