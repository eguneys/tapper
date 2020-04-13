export const NbFutureTimes = 9;

export default function Future() {

  let state = {};

  this.state = () => state;

  this.init = (data) => {
    state.time = data.time;
    state.vision = data.vision;
  };


  const travelPast = () => {
    if (state.time === 0) {
      return;
    }
    state.time = state.time - 1;
  };

  const travelFuture = () => {
    if (state.time === NbFutureTimes - 1) {
      return;
    }
    state.time = state.time + 1;
  };

  const visionUp = () => {
    state.vision++;
  };

  const visionDown = () => {
    state.vision--;
  };

  this.update = delta => {

    

  };

}
