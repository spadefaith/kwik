import Custom from "./services/custom";
import { generateId } from "./utils/rand";
import createSignal from "./services/signal";
import { getComments, stringToHTML } from "./utils/el";
import ArrayWrapper from "./utils/array";
import Lifecycle from "./services/lifecycle";

const Component = class {
  name: string;
  id: string;
  attributes: string[];
  template: any;
  callback: any;
  custom: any;
  componentCallback: any;
  componentDisconnectCallback: any;
  signals: any;
  styles: any;
  events: any;
  lifecycle: Lifecycle;
  constructor(callback) {
    this.callback = callback;
    this.id = generateId();
    this.name = `x-${this.id}`;

    this.attributes = [];
    this.template = {};
    this.signals = {};
    this.styles = {};
    this.events = [];

    this.lifecycle = new Lifecycle();
    this._initLifecycle();
    this._createTemplate();
    this._createCustom();
  }
  _initLifecycle() {
    this.lifecycle.rendered((el) => {
      Object.keys(this.styles).forEach((id) => {
        const styles = this.styles[id];
        const target: HTMLElement = document.querySelector(
          `[data-style=${id}]`
        );

        if (target) {
          Object.keys(styles).forEach((key) => {
            target.style[key] = styles[key];
          });
        }
      });
    });

    this.lifecycle.change(({ name, oldValue, newValue }) => {
      if (this.signals[name]) {
        this.signals[name].forEach((signal) => {
          if (oldValue != newValue) {
            signal.value = newValue;
          }
        });
      }
    });
  }
  _createTemplate() {
    const template = this.callback({
      node: this._nodeCallback.bind(this),
      render: this._renderCallback.bind(this),
      attr: this._attrCallback.bind(this),
      events: this._eventsCallback.bind(this),
      connectedCallback: this._connectedCallback.bind(this),
      props: this._propsCallback.bind(this),
      style: this._styleCallback.bind(this),
    });

    this.template = template;
  }
  _styleCallback(obj) {
    const id = generateId();
    this.styles[id] = obj;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (value.isSignal) {
        this._registerSignal(key, value);

        value.subscribe((v) => {
          const target: HTMLElement = document.querySelector(
            `[data-style=${id}]`
          );
          if (target) {
            target.style[key] = v;
          }
        });
      }
    });
    return `data-style=${id}`;
  }
  _propsCallback(name, initialValue) {
    this.attributes.push(name);

    const signal = createSignal(initialValue);

    this._registerSignal(name, signal);

    return signal;
  }
  _connectedCallback(callback) {
    this.lifecycle.rendered(callback);
    this.lifecycle.destroy(() => callback());
  }
  _eventsCallback(events) {
    return Object.keys(events)
      .map((key) => {
        const handler = events[key];
        const id = generateId();

        this.events.push({
          id,
          type: key,
          handler,
        });

        return `data-event=${key}-${id}`;
      })
      .join(" ");
  }
  _attrCallback(attr, signal) {
    if (signal.isSignal) {
      this._registerSignal(signal.id, signal);
      signal.subscribe((value) => {});
    }

    return `${attr}=${signal}`;
  }
  _nodeCallback(signal) {
    this._registerSignal(signal.id, signal);

    signal.subscribe((value) => {
      const id = signal.id;

      const self = document.querySelector(this.name);

      if (self) {
        setTimeout(() => {
          const node = getComments(self, `node ${id}`);

          if (node.length) {
            node.forEach((n) => {
              const next = n.nextSibling;
              if (next.nodeType == 3) {
                if (next.nodeValue[0] == " ") {
                  next.nodeValue = ` ${signal}`;
                } else {
                  next.nodeValue = signal;
                }
              }
            });
          }

          // console.log(50, id, node);
        });
      }
    });

    return `<!--node ${signal.id}--> ${signal}`;
  }
  _renderCallback(signal, template, opts: any = {}) {
    const templateIsString = typeof template == "string";
    const templateIsFunction = typeof template == "function";

    if (opts.replace == undefined) {
      opts.replace = templateIsString ? true : false;
    }

    signal.subscribe((value) => {
      if (Array.isArray(value)) {
        value = new ArrayWrapper(value).data;
      }

      const id = signal.id;
      const self = document.querySelector(this.name);
      if (self) {
        setTimeout(() => {
          const node = getComments(self, `render ${id}`);
          if (node.length) {
            node.forEach((n) => {
              let r = null;
              if (templateIsString) {
                if (opts.renderer) {
                  r = opts.renderer.render(template, {
                    list: value,
                  });
                } else {
                  throw new Error("renderer is required");
                }
              } else if (templateIsFunction) {
                r = template(value);
              }

              if (!n.isInitialized) {
                n.isInitialized = true;
              }

              if (n.isInitialized) {
                if (opts.replace) {
                  const next = n.nextSibling;
                  next.remove();
                }
              }

              if (!r) {
                return;
              }

              const rHtml = stringToHTML(r);

              n.parentElement.insertBefore(rHtml.firstChild, n.nextSibling);
            });
          }
        });
      }
    });

    return `<!--render ${signal.id}-->`;
  }
  _createCustom() {
    this.custom = Custom(this, this.lifecycle);
  }
  _registerSignal(name, signal) {
    if (!this.signals[name]) {
      this.signals[name] = [];
    }
    this.signals[name].push(signal);
  }
};

export default Component;
