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
    this.subscribers = [];
    this.pubsub = new EventBus();
  }
  _notify() {
    this.pubsub.broadcast("signal", this._value);
  }
  get value() {
    return this._value;
  }
  set value(v) {
    this._value = v;
    this._notify();
  }
  subscribe(subscriber) {
    this.pubsub.on("signal", subscriber);
  }

  toString() {
    return this._value.toString();
  }

  get isSignal() {
    return true;
  }
}
