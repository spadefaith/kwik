import { loop } from "../utils/loop";

export default class Lifecycle {
  subscriber: any;
  constructor() {
    this.subscriber = {
      destroy: [],
      rendered: [],
      change: [],
      adopted: [],
    };
  }

  destroy(callback) {
    this.subscriber.destroy.push(callback);
  }

  rendered(callback) {
    this.subscriber.rendered.push(callback);
  }

  change(callback) {
    this.subscriber.change.push(callback);
  }

  adopted(callback) {
    this.subscriber.adopted.push(callback);
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
