import { loop } from "./loop";

export default class DataWrapper {
  constructor(public ctx) {
    this.ctx = ctx;
  }
  get data() {
    return this.ctx;
  }
  get isEmpty() {
    const type = typeof this.ctx;
    if (!this.ctx) {
      return true;
    } else if (type === "object") {
      return Object.keys(this.ctx).length === 0;
    }
    return this.ctx.length == 0 || this.ctx.size == 0;
  }
  each(callback) {
    let str = "";
    loop(this.ctx, (value, key) => {
      str += callback(value, key);
    });
    return str;
  }
}
