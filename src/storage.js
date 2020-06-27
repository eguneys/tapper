export default function Storage(name, defaultValue) {

  let storage = window.localStorage;

  const set = (value) => storage.setItem(name, value);
  const get = (defaultValue) => {
    let res = storage.getItem(name);
    if (res === undefined || res === null) {
      return defaultValue;
    }
    return res;
  };
  const remove = () => storage.removeItem(name);

  this.apply = (value) => {
    if (value !== undefined && value !== null) {
      set(value);
    }
    return get(defaultValue);
  };

  this.boolean = (value) => {
    if (value === true || value === false) {
      set(value?"1":"0");
    }
    return get(defaultValue?"1":"0")==="1"? true:false;
  };

  this.remove = () => remove();
  
}
