import Component from "./components";

type ParamsType = {
  node: (str) => any;
  attr: (str) => any;
  signal: (any) => any;
};
export default class Blueprint {
  callback: any;
  current: any;
  /**
   * @param {(params: ParamsType) => void} callback - The callback function that accepts an object with methods `node`, `attr`, and `signal`.
   */
  constructor(callback) {
    this.callback = callback;
    this.current = null;
  }
  build() {
    this.current = new Component(this.callback);
    return this.current.name;
  }
  toString() {
    return this.build();
  }

  get close() {
    return this.current.name;
  }
}
