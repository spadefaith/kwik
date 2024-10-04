/**
 * Converts a callback-based function to a Promise-based one.
 *
 * @param callback - The function to be promisified. Must be a function.
 * @param args - The arguments to pass to the callback function.
 * @returns A Promise that resolves with the result of the callback function or rejects with an error.
 * @throws Will throw an error if the first argument is not a function.
 */
export const promisify = (callback, ...args) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof callback !== "function") {
        throw new Error("First argument must be a function");
      }
      const isAsync = callback.constructor.name === "AsyncFunction";
      if (isAsync) {
        callback
          .apply(this, args)
          .then((resp) => resolve(resp))
          .catch((err) => reject(err));
      } else {
        const resp = callback.apply(this, args);
        resolve(resp);
      }
    } catch (err) {
      reject(err);
    }
  });
};
