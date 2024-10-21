import { loop } from "./loop";

/**
 * A class that wraps data and provides utility methods to interact with it.
 */
export default class DataWrapper {
  /**
   * Creates an instance of DataWrapper.
   * @param ctx - The context or data to be wrapped.
   */
  constructor(public ctx) {
    this.ctx = ctx;
  }

  /**
   * Gets the wrapped data.
   * @returns The wrapped data.
   */
  get data() {
    if (typeof this.ctx == 'string') {
      try {
        return JSON.parse(this.ctx);

      } catch (err) { }
    }
    return this.ctx
  }

  /**
   * Checks if the wrapped data is empty.
   * @returns `true` if the data is empty, otherwise `false`.
   */
  get isEmpty() {
    const type = typeof this.ctx;

    if (!this.ctx) {
      return true;
    }
    if (this.ctx.size !== undefined) {
      return this.ctx.size === 0;
    } else if (this.ctx.length !== undefined) {
      return this.ctx.length === 0;
    }

    if (type === "object") {
      return Object.keys(this.ctx).length === 0;
    }

    return true;
  }

  /**
   * Iterates over the wrapped data and applies a callback function to each element.
   * @param callback - The function to be called for each element. It receives the value and key as arguments.
   * @returns A concatenated string of the results of the callback function.
   */
  each(callback) {
    let str = "";
    let arr = this.data;



    loop(arr || [], (value, key) => {
      str += callback(value, key);
    });
    return str;
  }
}
