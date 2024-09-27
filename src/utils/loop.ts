export const loop = (array, callback) => {
  if (!array) return;

  switch (array.constructor.name) {
    case "Array": {
      for (let i = 0; i < array.length; i++) {
        callback(array[i], i);
      }
      break;
    }
    case "Object": {
      for (let key in array) {
        callback(array[key], key);
      }
      break;
    }
    case "Map": {
      for (let [key, value] of array.entries()) {
        callback(value, key);
      }
      break;
    }
    default: {
      if (array.length) {
        for (let i = 0; i < array.length; i++) {
          callback(array[i], i);
        }
      }
    }
  }
};
