export function SpiderFxSelectedStack(spider) {

  let fxSettleStackCancel = new SpiderFxSettleStackCancel(spider, this),
      fxSettleStackStack = new SpiderFxSettleStackStack(spider, this);

  let settleFx;

  let sData = spider.data;

  let data = this.data = {
    stack: true
  };

  let hasMoved;

  this.settleFx = () => settleFx;

  this.doBegin = (stackN, cardN, epos, decay) => {
    data.stackN = stackN;
    data.cardN = cardN;
    data.epos = epos;
    data.decay = decay;

    let stack = sData.stacks[data.stackN];
    data.stack = stack.cut1(data.cardN);

    settleFx = undefined;
    hasMoved = false;

    spider.persistSelectEnd();
  };

  this.doUpdate = (epos) => {
    data.epos = epos;
    hasMoved = true;
  };

  this.doEnd = () => {

  };


  this.endCancel = () => {
    fxSettleStackCancel.doBegin(data.stackN, data.stack, hasMoved);
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
};

export function SpiderFxSettleStackCancel(spider, baseFx) {

  let sData = spider.data;

  let data = this.data = {
    stack: true,
    dststack: true
  };
  
  this.doBegin = (dstStackN, stack, hasMoved) => {
    data.dstStackN = dstStackN;
    data.stack = stack;
    data.hasMoved = hasMoved;
  };

  this.doEnd = () => {
    let stack = sData.stacks[data.dstStackN];
    stack.add1(data.stack);

    if (!data.hasMoved) {
      spider.persistSelect(data.dstStackN, data.stack);
    } else {
      spider.persistSelectEnd();
    }
  };
}

export function SpiderFxSettleStackStack(spider, baseFx) {

  let sData = spider.data;

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

    spider.revealStack(srcStack);

    if (data.srcStackN === data.dstStackN) {
      spider.persistSelect(data.dstStackN, data.stack);
    }
  };
}
