export default function SoliHoller() {

  const hollsData = [13, 13, 13, 13];

  let i;
  let done;

  let holls;

  this.init = () => {
    done = false;
    i = 0;
    holls = hollsData.slice(0);
  };

  this.acquireHole = () => {
    if (done) {
      return null;
    }

    let holeI = i;
    holls[i]--;

    i = (i + 1) % holls.length;

    if (holls[holeI] === 0 && holeI === 3) {
      done = true;
    }

    return holeI;
  };

}
