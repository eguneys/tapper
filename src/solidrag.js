export default function SoliDrag() {

  let state = {};

  this.state = () => state;

  this.dragEmptyStart = () => {
    state = {};
  };
  
  this.dragStackStart = (dragStackStart) => {
    state = {
      drag: {
        stack: dragStackStart
      },
      initial: true
    };
  };

  this.dragDrawStart = (dragDrawStart) => {
    state = {
      drag: {
        draw: dragDrawStart
      },
      initial: true
    };
  };

  this.dragHoleStart = (dragHoleStart) => {
    state = {
      drag: {
        hole: dragHoleStart
      },
      initial: true
    };
  };

  this.moving = () => {
    state.initial = false;
  };

  // drop happens without drag
  this.dropCancel = () => {
    if (!state.drag) {
      state = {};
      return;
    }
    state.cancel = state.drag;
    delete state.drag;
  };

  this.dropStack = (drop) => {
    if (!state.drag) {
      state = {};
      return;
    }
    state.dropstack = {
      drag: state.drag,
      drop
    };
    delete state.drag;
  };

  this.dropHole = (drop) => {
    if (!state.drag) {
      state = {};
      return;
    }
    state.drophole = {
      drop,
      drag: state.drag
    };
    delete state.drag;
  };
  

}
