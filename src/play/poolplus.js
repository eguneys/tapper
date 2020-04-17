import Pool from 'poolf';

export default function PoolPlus(onCreate) {

  let frame = 0;

  let pool = new Pool(() => {
    let body = onCreate();

    return {
      body
    };
  });


  this.getOrAcquire = (id, onInit) => {
    let res = pool.find(_ => _.id === id);
    if (!res) {
      res = pool.acquire((_) => {
        _.id = id;
        onInit(_.body);
      });
    }

    return res.body;
  };

  this.each = (fn) => pool.each(_ => fn(_.body));

  this.release = item => {
    pool.releaseIf(_ => _.body === item);
  };

  this.releaseAll = () => {
    pool.releaseAll();
  };
}
