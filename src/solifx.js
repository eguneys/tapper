export function SoliFxSelectedStack(solitaire) {

  let fxSettleStackCancel = new SoliFxSettleStackCancel(solitaire, this),
      fxSettleStackStack = new SoliFxSettleStackStack(solitaire, this),
      fxSettleStackHole = new SoliFxSettleStackHole(solitaire, this);

  let settleFx;

  let sData = solitaire.data;

  let data = this.data = {
    stack: true
  };

  this.settleFx = () => settleFx;

  this.doBegin = (stackN, cardN, epos, decay) => {
    data.stackN = stackN;
    data.cardN = cardN;
    data.epos = epos;
    data.decay = decay;

    let stack = sData.stacks[stackN];

    data.stack = stack.cut1(cardN);

    settleFx = undefined;
  };

  this.doUpdate = (epos) => {
    data.epos = epos;
  };

  this.doEnd = () => {

  };

  

  this.endCancel = () => {
    fxSettleStackCancel.doBegin(data.stackN, data.stack);
    settleFx = fxSettleStackCancel;
  };

  this.endStack = (dstStackN) => {
    if (!fxSettleStackStack.canSettle(data.stackN, dstStackN, data.stack)) {
      this.endCancel();
      return;
    }
    fxSettleStackStack.doBegin(data.stackN, dstStackN, data.stack);
    settleFx = fxSettleStackStack;
  };

  this.endHole = (dstHoleN) => {
    if (!fxSettleStackHole.canSettle(data.stackN, dstHoleN, data.stack)) {
      this.endCancel();
      return;
    }

    fxSettleStackHole.doBegin(data.stackN, dstHoleN, data.stack);
    settleFx = fxSettleStackHole;
  };
}

export function SoliFxSelectedDraw(solitaire) {

  let fxSettleDrawCancel = new SoliFxSettleDrawCancel(solitaire, this),
      fxSettleDrawStack = new SoliFxSettleDrawStack(solitaire, this),
      fxSettleDrawHole = new SoliFxSettleDrawHole(solitaire, this);

  let settleFx;

  let sData = solitaire.data;

  let data = this.data = {
    draw: true
  };

  this.settleFx = () => settleFx;

  this.doBegin = (epos, decay) => {
    data.epos = epos;
    data.decay = decay;
    data.stack = [sData.showStack.pop()];
    settleFx = undefined;
  };

  this.doUpdate = (epos) => {
    data.epos = epos;
  };

  this.doEnd = () => {

  };

  

  this.endCancel = () => {
    fxSettleDrawCancel.doBegin(data.stack);
    settleFx = fxSettleDrawCancel;
  };

  this.endStack = (dstStackN) => {
    if (!fxSettleDrawStack.canSettle(dstStackN, data.stack)) {
      this.endCancel();
      return;
    }
    
    fxSettleDrawStack.doBegin(dstStackN, data.stack);
    settleFx = fxSettleDrawStack;
  };

  this.endHole = (dstHoleN) => {

    if (!fxSettleDrawHole.canSettle(dstHoleN, data.stack)) {
      this.endCancel();
      return;
    }

    fxSettleDrawHole.doBegin(dstHoleN, data.stack);
    settleFx = fxSettleDrawHole;
  };
}


export function SoliFxSelectedHole(solitaire) {

  let fxSettleHoleCancel = new SoliFxSettleHoleCancel(solitaire, this),
      fxSettleHoleStack = new SoliFxSettleHoleStack(solitaire, this);

  let settleFx;

  let sData = solitaire.data;

  let data = this.data = {
    hole: true
  };

  this.settleFx = () => settleFx;

  this.doBegin = (srcHoleN, epos, decay) => {
    data.epos = epos;
    data.decay = decay;
    data.srcHoleN = srcHoleN;

    let hole = sData.holes[srcHoleN];
    let card = hole.remove();
    data.stack = [card];

    settleFx = undefined;
  };

  this.doUpdate = (epos) => {
    data.epos = epos;
  };

  this.doEnd = () => {

  };

  

  this.endCancel = () => {
    fxSettleHoleCancel.doBegin(data.srcHoleN, data.stack);
    settleFx = fxSettleHoleCancel;
  };

  this.endStack = (dstStackN) => {

    if (!fxSettleHoleStack.canSettle(data.srcHoleN, dstStackN, data.stack)) {
      this.endCancel();
      return;
    }

    fxSettleHoleStack.doBegin(data.srcHoleN, dstStackN, data.stack);
    settleFx = fxSettleHoleStack;
  };

  this.endHole = () => {
    this.endCancel();
  };
}

export function SoliFxSettleDrawCancel(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    draw: true,
    dstdraw: true
  };

  this.doBegin = (stack) => {
    data.stack = stack;
  };

  this.doEnd = () => {
    sData.showStack.push(data.stack[0]);
  };
}

export function SoliFxSettleDrawStack(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    draw: true,
    dststack: true,
  };

  this.canSettle = (dstStackN, stack) => {
    let dstStack = sData.stacks[dstStackN];
    return dstStack.canAdd(stack);
  };
  
  this.doBegin = (dstStackN, stack) => {
    data.dstStackN = dstStackN;
    data.stack = stack;
  };

  this.doEnd = () => {

    let stack = sData.stacks[data.dstStackN];
    stack.add1(data.stack);    
  };
}

export function SoliFxSettleDrawHole(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    draw: true,
    dsthole: true,
  };

  this.canSettle = (dstHoleN, stack) => {
    let hole = sData.holes[dstHoleN];
    return hole.canAdd(stack);
  };
  
  this.doBegin = (dstHoleN, stack) => {
    data.dstHoleN = dstHoleN;
    data.stack = stack;
  };

  this.doEnd = () => {
    let card = data.stack[0];
    solitaire.addHole(data.dstHoleN, card);
  };
}

export function SoliFxSettleStackCancel(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    stack: true,
    dststack: true
  };
  
  this.doBegin = (dstStackN, stack) => {
    data.dstStackN = dstStackN;
    data.stack = stack;
  };

  this.doEnd = () => {
    let stack = sData.stacks[data.dstStackN];
    stack.add1(data.stack);
  };
}

export function SoliFxSettleStackStack(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    stack: true,
    dststack: true
  };

  this.canSettle = (srcStackN, dstStackN, stack) => {
    let dstStack = sData.stacks[dstStackN];
    return dstStack.canAdd(stack);
  };

  this.doBegin = (srcStackN, dstStackN, stack) => {
    data.srcStackN = srcStackN;
    data.dstStackN = dstStackN;
    data.stack = stack;
  };

  this.doEnd = () => {

    let stack = sData.stacks[data.dstStackN];
    stack.add1(data.stack);

    let srcStack = sData.stacks[data.srcStackN];

    solitaire.revealStack(srcStack);
  };
}


export function SoliFxSettleStackHole(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    stack: true,
    dsthole: true
  };

  this.canSettle = (srcStackN, dstHoleN, stack) => {
    let hole = sData.holes[dstHoleN];
    return hole.canAdd(stack);    
  };

  this.doBegin = (srcStackN, dstHoleN, stack) => {
    data.srcStackN = srcStackN;
    data.dstHoleN = dstHoleN;
    data.stack = stack;
  };

  this.doEnd = () => {

    let card = data.stack[0];
    solitaire.addHole(data.dstHoleN, card);

    let srcStack = sData.stacks[data.srcStackN];
    solitaire.revealStack(srcStack);
  };
}


export function SoliFxSettleHoleCancel(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    hole: true,
    dsthole: true
  };

  this.doBegin = (srcHoleN, stack) => {
    data.srcHoleN = srcHoleN;
    data.dstHoleN = srcHoleN;
    data.stack = stack;
  };

  this.doEnd = () => {
    let hole = sData.holes[data.srcHoleN];
    
    let card = data.stack[0];

    hole.add(card);
  };
}

export function SoliFxSettleHoleStack(solitaire, baseFx) {

  let sData = solitaire.data;

  let data = this.data = {
    hole: true,
    dststack: true
  };

  this.canSettle = (srcHoleN, dstStackN, stack) => {
    let dstStack = sData.stacks[dstStackN];
    return dstStack.canAdd(stack);
  };

  this.doBegin = (srcHoleN, dstStackN, stack) => {
    data.srcHoleN = srcHoleN;
    data.dstStackN = dstStackN;
    data.stack = stack;
  };

  this.doEnd = () => {
    let stack = sData.stacks[data.dstStackN];
    stack.add1(data.stack);
  };
}
