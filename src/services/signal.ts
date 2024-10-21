import { generateId } from "../utils/rand";
import EventBus from "./event-bus";

export default class Signal<T = any> {
  id: string;
  _value: T;
  subscribers: any[];
  pubsub: EventBus;
  allWaysNotify: boolean;
  constructor(initialValue: T, allWaysNotify = false) {
    this.id = generateId();
    this._value = initialValue;
    this.pubsub = new EventBus();
    this.allWaysNotify = allWaysNotify;
  }

  /**
   * Notifies all subscribers by broadcasting the current signal value.
   * 
   * @private
   * @method
   * @memberof SignalService
   */
  _notify() {
    this.pubsub.broadcast("signal", this._value);
  }

  /**
   * Retrieves the current value of the signal.
   * If the value is a JSON string, it attempts to parse it.
   * If the value is the string "undefined" or "null", it converts it to the corresponding type.
   *
   * @returns {T | any} The current value of the signal, parsed if necessary.
   */
  get value() {
    let v = this._value;
    if (typeof v == 'string') {
      try {
        v = JSON.parse(v);
      } catch (err) { }
    }

    if (v == "undefined") v = undefined;
    if (v == "null") v = null;

    return v as T | any;
  }
  /**
   * Sets the value of the signal. If the new value is equal to the current value,
   * the setter returns early without making any changes. Otherwise, it updates
   * the value and notifies any observers.
   *
   * @param v - The new value to set.
   */
  set value(v) {
    let isSame = false;
    //TODO - there is a bug, that if the value is a boolean, 
    //it will change the previous state automatically
    //that is why allWaysNotify is added to be notified
    //even the vakue is the same 
    if (!this.allWaysNotify) {
      isSame = this._checkEquality(this.value, v);
    }

    if (isSame) return;

    this._value = v;
    this._notify();
  }
  /**
   * Subscribes a given subscriber function to the "signal" event.
   * 
   * @param subscriber - A function that will be called with the data from the "signal" event.
   */
  subscribe(subscriber) {
    this.pubsub.on("signal", (data, next) => {
      subscriber(data);
      next();
    });
  }

  /**
   * Converts the value of the current instance to a string.
   * 
   * - If the value is a string, it returns the value directly.
   * - If the value is an object and has a `toString` method, it calls and returns the result of `toString`.
   * - Otherwise, it returns the JSON string representation of the value.
   * 
   * @returns {string} The string representation of the value.
   */
  toString() {
    if (this.value == null || this.value == undefined) {
      return String(this.value);
    }
    if (typeof this.value == 'string') {
      return this.value;
    } else if (typeof this.value == 'object' && this.value.hasOwnProperty('toString')) {
      return this.value.toString();
    }
    return JSON.stringify(this.value);
  }

  /**
   * Checks the equality of two values.
   *
   * This method compares two values `a` and `b` to determine if they are equal.
   * It performs type checking and compares the values based on their types.
   *
   * @param a - The first value to compare.
   * @param b - The second value to compare.
   * @returns `true` if the values are equal, `false` otherwise.
   */
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

  /**
   * A getter that always returns `true`, indicating that this object is a signal.
   * 
   * @returns {boolean} Always returns `true`.
   */
  get isSignal() {
    return true;
  }
}
