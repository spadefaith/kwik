/**
 * Iterates over elements of an array, object, or map and invokes a callback for each element.
 *
 * @param array - The collection to iterate over. Can be an array, object, or map.
 * @param callback - The function to invoke for each element. It receives two arguments: the value and the key/index.
 */
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

/**
 * Asynchronously iterates over elements of an array, object, or map and invokes a callback for each element.
 *
 * @param array - The collection to iterate over. Can be an array, object, or map.
 * @param callback - The async function to invoke for each element. It receives two arguments: the value and the key/index.
 * @returns A promise that resolves when all elements have been processed.
 */
export const loopAsync = async (array, callback): Promise<void> => {
  if (!array) return;

  async function* asyncIterableArray(array) {
    for (let i = 0; i < array.length; i++) {
      yield [array[i], i];
    }
  }

  async function* asyncIterableObject(obj) {
    for (let key in obj) {
      yield [obj[key], key];
    }
  }

  async function* asyncIterableMap(map) {
    for (let [key, value] of map.entries()) {
      yield [value, key];
    }
  }

  const ctcConstructorName = array.constructor.name;

  for await (let [value, key] of ctcConstructorName == "Array"
    ? asyncIterableArray(array)
    : ctcConstructorName == "Object"
    ? asyncIterableObject(array)
    : ctcConstructorName == "Map"
    ? asyncIterableMap(array)
    : asyncIterableArray(array)) {
    await callback(value, key);
  }
};
