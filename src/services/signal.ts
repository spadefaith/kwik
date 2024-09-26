import { generateId } from "../utils/rand";

export default function createSignal(initialValue) {
  let _value = initialValue;
  let subscribers = [];

  function notify() {
    for (let subscriber of subscribers) {
      subscriber(_value);
    }
  }

  return {
    id: generateId(),
    get value() {
      return _value;
    },
    set value(v) {
      _value = v;
      notify();
    },
    subscribe: (subscriber) => {
      subscribers.push(subscriber);
    },
    toString: () => _value.toString(),
    get isSignal() {
      return true;
    },
  };
}
