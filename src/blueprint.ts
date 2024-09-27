import Component from "./components";

export default class Blueprint {
  callback: any;
  current: any;
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
