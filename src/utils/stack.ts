export default async function Stack(array, callback) {
  const l = array.length;
  let index = 0;
  const cache = [];

  function recurse(callback, rej, res) {
    if (index < l) {
      const item = array[index];
      callback(item, index)
        .then((result) => {
          index += 1;
          cache.push(result);
          recurse(callback, rej, res);
        })
        .catch((err) => {
          rej(err);
        });
    } else {
      res(cache);
    }
  }

  return new Promise((res, rej) => {
    try {
      recurse(callback, rej, res);
    } catch (err) {
      rej(err);
    }
  });
}
