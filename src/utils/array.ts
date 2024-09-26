export default class ArrayWrapper {
  constructor(public array) {
    this.array = array;
  }
  get data() {
    if (Array.isArray(this.array)) {
      return this;
    } else {
      return this.array;
    }
  }
  each(callback) {
    return this.array.map(callback).join("");
  }
}
