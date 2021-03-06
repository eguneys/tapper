import { rect } from '../dquad/geometry';

import { dContainer } from '../asprite';

import AContainer from './acontainer';

import CardBackground from './cardbackground';

import GSolitaire from '../gsolitaire';
import Solitaire from '../solitaire';

import SoliGameOver from './soligameover';
import SoliHoller from './soliholler';
import SoliTutorial from './solitutorial';
import SoliSoul from './solisoul';
import SoliHoles from './soliholes';
import SoliStacks from './solistacks';
import SoliDraw from './solidraw';
import SoliDeal from './solideal';
import SoliReveal from './solireveal';
import SoliDrag from './solidrag';
import SoliMove from './solimove';

import { moveHandler2 } from './util';

export default function SolitaireView(play, ctx, pbs) {

  const { events } = ctx;

  let bs = (() => {
    let { width, height } = pbs;

    let stackMargin = Math.round(height * 0.04 / 4);
    let heightMargin = Math.round(height * 0.02 / 4);

    let cRatio = 64 / 89;
    let cMargin = stackMargin * 0.1,
        cHeight = height / 4 - heightMargin * 4.0,
        cWidth = cRatio * cHeight;
    cHeight = Math.floor(cHeight);
    cWidth = Math.floor(cWidth);
    let card = rect(0, 0, cWidth, cHeight);

    let draws = rect(stackMargin, stackMargin,
                     cWidth, cHeight);

    let drawGap = stackMargin * 2.0;

    let stacks = rect(draws.x1 + drawGap,
                      stackMargin,
                      (cWidth + stackMargin),
                      height - stackMargin);

    let holes = rect(stacks.x + stacks.width * 7 + drawGap,
                     stacks.y,
                     0, (cHeight + heightMargin * 3.0));

    let deck = rect(0, 0, cWidth, cHeight * 0.2);

    let boundsMargin = stackMargin;

    let barWidth = cWidth * 1.1;

    let barHeight = cHeight * 2.0;

    let bar = rect(width - barWidth, barHeight,
                   barWidth,
                   height - barHeight - boundsMargin * 2.0);

    let text = {
      p: width * 0.03,
      h1: width * 0.05,
    };

    let uiMargin = width * 0.02;

    let tutorialWidth = width * 0.8,
        tutorialHeight = height * 0.9;
    let tutorial = rect(0,
                        0,
                        tutorialWidth,
                        tutorialHeight);
    
    return {
      tutorial,
      uiMargin,
      text,
      deck,
      stackMargin,
      cMargin,
      card,
      stacks,
      holes,
      draws,
      bar,
      width,
      height
    };
  })();

  let cardGame = this.cardGame = play.cardGame;
  let gsolitaire = this.gsolitaire = new GSolitaire(cardGame);
  let solitaire = this.solitaire = new Solitaire();

  let dGameOver = new SoliGameOver(this, ctx, bs);

  let dTutorial = new SoliTutorial(this, ctx, bs);

  let dSoul = new SoliSoul(this, ctx, bs);

  let dBg = new CardBackground(this, ctx, bs);

  let dDraw = new SoliDraw(this, ctx, bs);

  let dStacks = new SoliStacks(this, ctx, bs);

  let dHoles = new SoliHoles(this, ctx, bs);

  let dSoliDeal = new SoliDeal(this, ctx, bs);

  let dSoliDrag = new SoliDrag(this, ctx, bs);

  let dSoliReveal = new SoliReveal(this, ctx, bs);

  let dSoliMove = new SoliMove(this, ctx, bs);

  this.dHoleN = dHoles.dHoleN;
  this.dStackN = dStacks.dStackN;
  this.dDrawN = dDraw.dDrawN;
  this.dDraw = dDraw;

  let dHoller = new SoliHoller(this, ctx, bs);

  this.getHitKeyForEpos = epos => {

    let res = [dStacks, 
               dDraw,
               dHoles]
        .reduce((acc, hitTarget) =>
          acc ? acc : hitTarget.getHitKeyForEpos(epos),
        null);

    return res;
  };

  let container = this.container = new AContainer();
  const initContainer = () => {

    container.addChild(dSoul);

    container.addChild(dBg);

    container.addChild(dDraw);
    dDraw.container.move(bs.draws.x, bs.draws.y);

    container.addChild(dStacks);
    dStacks.container.move(bs.stacks.x, bs.stacks.y);

    container.addChild(dHoles);
    dHoles.container.move(bs.holes.x, bs.holes.y);

    container.addChild(dSoliDeal);
    container.addChild(dSoliReveal);
    container.addChild(dSoliMove);

    container.addChild(dSoliDrag);

    container.addChild(dTutorial);
    dTutorial.container.center(bs.width, bs.height);

    container.addChild(dHoller);

    container.addChild(dGameOver);
  };
  initContainer();

  let { fixtures, playStore, optionsStore } = ctx;

  let once = true;

  this.init = (data) => {
    let play = playStore.play('solitaire');

    if (once) {
      once = false;
      play = fixtures.playEnding;
    }

    gsolitaire.userInit({
      play,
      options: optionsStore.solitaire()
    });
  };

  gsolitaire.oSaveState.subscribe(state => {
    playStore.play('solitaire', state);
  });

  this.remove = () => {
    solitaire.remove();
  };

  const handleTap = moveHandler2({
    onMove(epos) {
      solitaire.userActionMove(epos);
    },
    onEnd() {
      solitaire.userActionEndTap();
    }
  }, events);

  this.update = delta => {
    // order matters end select comes before end tap
    this.container.update(delta);
    handleTap();
  };

  this.render = () => {
    this.container.render();
  };
}
