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

  broadcast(event: "destroy" | "adopted" | "rendered" | "change", data) {
    if (this.subscriber[event]) {
      this.subscriber[event].forEach((callback) => {
        callback(data);
      });
    }
  }

  clean(event) {
    if (event && this.subscriber[event]) {
      this.subscriber[event] = [];
    } else {
      this.subscriber = {
        destroy: [],
        rendered: [],
        change: [],
        adopted: [],
      };
    }
  }
}
