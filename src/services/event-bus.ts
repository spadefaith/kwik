import { loop } from "../utils/loop";

export default class EventBus {
  subscriber: any;
  constructor() {
    this.subscriber = {};
  }

  on(event, callback) {
    if (!this.subscriber[event]) {
      this.subscriber[event] = [];
    }

    this.subscriber[event].push(callback);
  }

  broadcast(event, data) {
    const listeners = this.subscriber[event];
    let index = 0;
    const recur = (listeners) => {
      if (listeners.length > index) {
        let callback = listeners[index];
        callback(data, () => {
          index++;
          recur(listeners);
        });
      }
      if (listeners.length - 1 == index) {
      }
    };

    recur(listeners);
  }

  clean(event) {
    if (event) {
      this.subscriber[event] && (this.subscriber[event] = []);
    } else {
      loop(this.subscriber, (event) => {
        this.subscriber[event] = [];
      });
    }
  }
}
