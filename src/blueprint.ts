import Component from "./components";

export default class Blueprint {
  callback: any;
  current: any;
  constructor(callback) {
    this.callback = callback;
    this.current = null;
  }

  toString() {
    this.current = new Component(this.callback);
    return this.current.name;
  }

  close() {
    return this.current.name;
  }
}
