export const fConstant = constant => _ => constant;
export const fId = _ => _;
export const fBoolean = _ => !!_;
export const fToggle = _ => !_;
export const fFalse = fConstant(false);
export const fTrue = fConstant(true);
export const fNull = fConstant(null);

