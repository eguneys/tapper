export default function Fx(data, key, onEnd = () => {}) {

  let state = {};

  this.begin = (value) => {
    state.value = value;
    data[key] = state;
  };

  this.value = () => state.value;

  const end = () => {
    onEnd(state.value);
    state.value = undefined;
    delete data[key];
  };

  this.end = () => {
    if (state.value) {
      state.end = true;
    }
  };

  this.cancel = () => {
    state.end = false;
    state.value = undefined;
    delete data[key];
  };

  this.endNow = () => {
    if (state.value) {
      state.end = false;
      end();
    }
  };

  this.update = (delta) => {
    if (state.end) {
      state.end = false;
      end();
    }
  };
}
