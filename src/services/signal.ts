import { generateId } from "../utils/rand";

export default class Signal {
  id: string;
  _value: any;
  subscribers: any[];
  constructor(initialValue) {
    this.id = generateId();
    this._value = initialValue;
    this.subscribers = [];
  }
  _notify() {
    for (let subscriber of this.subscribers) {
      subscriber(this._value);
    }
  }

  get value() {
    return this._value;
  }
  set value(v) {
    this._value = v;
    this._notify();
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  toString() {
    return this._value.toString();
  }

  get isSignal() {
    return true;
  }
}
