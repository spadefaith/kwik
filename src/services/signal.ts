import { generateId } from "../utils/rand";
import EventBus from "./event-bus";

export default class Signal {
  id: string;
  _value: any;
  subscribers: any[];
  pubsub: EventBus;
  constructor(initialValue) {
    this.id = generateId();
    this._value = initialValue;
    this.pubsub = new EventBus();
  }
  _notify() {
    this.pubsub.broadcast("signal", this._value);
  }
  get value() {
    return this._value;
  }
  set value(v) {
    const test = this._checkEquality(this._value, v);
    if (test) {
      return;
    }
    this._value = v;
    this._notify();
  }
  subscribe(subscriber) {
    this.pubsub.on("signal", (data, next) => {
      subscriber(data);
      next();
    });
  }

  toString() {
    try {
      return this._value?.toString();
    } catch (e) {
      return String(this._value);
    }
  }

  _checkEquality(a, b) {
    const typeA = typeof a;
    const typeB = typeof b;

    if (typeA !== typeB) return false;

    if (typeA === "number" && typeB === "number") {
      return a === b;
    }

    if (typeA === "string" && typeB === "string") {
      return a === b;
    }
    if (typeA === "boolean" && typeB === "boolean") {
      return a === b;
    }

    if (typeA === "undefined" && typeB === "undefined") {
      return true;
    }

    if (typeA === null && typeB === null) {
      return true;
    }

    return false;
  }

  get isSignal() {
    return true;
  }
}
