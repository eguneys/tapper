import { rect } from '../dquad/geometry';

export default function GameBs(pbs) {

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
      bar,
      width,
      height
    };
  })();

  return bs;
}
