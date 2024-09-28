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
    loop(this.subscriber[event], (callback) => {
      callback(data);
    });
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
