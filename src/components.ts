import Custom from "./services/custom";
import { generateId } from "./utils/rand";
import { getComments, stringToHTML } from "./utils/el";
import ArrayWrapper from "./utils/array";
import Lifecycle from "./services/lifecycle";
import Signal from "./services/signal";
import { loop } from "./utils/loop";
import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";
export type AttributesItemType = {
  signal: string;
  name: string;
};

export type SignalItemType = {
  [key: string]: {
    signal: Signal;
    callbacks?: ((a: any) => any)[];
  };
};

const Component = class {
  name: string;
  id: string;
  attributes: AttributesItemType[];
  template: any;
  callback: any;
  custom: any;
  componentCallback: any;
  componentDisconnectCallback: any;
  signals: SignalItemType;
  styles: any;
  events: any;
  lifecycle: Lifecycle;
  props: any;
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
    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el) => {
      loop(this.styles, (id) => {
        const styles = this.styles[id];
        const target: HTMLElement = document.querySelector(
          `[data-style=${id}]`
        );

        if (target) {
          loop(styles, (key) => {
            target.style[key] = styles[key];
          });
        }
      });
    });
    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el) => {
      loop(this.signals, (a) => {
        const { signal, callbacks } = a;
        if (callbacks.length) {
          loop(callbacks, (callback) => {
            callback && callback(signal.value);
          });
        }
      });
    });

    this.lifecycle.on(
      COMPONENT_LIFECYCLE.CHANGE,
      ({ name, oldValue, newValue }) => {
        const getSignalId = this.attributes.find((item) => item.name == name);
        if (getSignalId) {
          const conf = this.signals[getSignalId.signal];
          if (oldValue != newValue) {
            conf.signal.value = newValue;
          }
        }
      }
    );

    this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, () => {
      this.attributes = [];
      this.template = {};
      this.signals = {};
      this.styles = {};
      this.events = [];
    });
  }
  _createTemplate() {
    const template = this.callback({
      node: this._nodeCallback.bind(this),
      render: this._renderCallback.bind(this),
      attr: this._attrCallback.bind(this),
      events: this._eventsCallback.bind(this),
      props: this._propsCallback.bind(this),
      style: this._styleCallback.bind(this),
      ref: this._refCallback.bind(this),
      signal: (value) => {
        return new Signal(value);
      },
      onConnected: this._connectedCallback.bind(this),
    });

    this.template = template;
  }
  _refCallback(callback?) {
    const id = generateId();

    if (callback) {
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, () => {
        const target: HTMLElement = document.querySelector(`[data-ref=${id}]`);
        callback(target);
      });
    }

    return {
      get current() {
        return document.querySelector(`[data-ref=${id}]`);
      },
      toString() {
        return `data-ref=${id}`;
      },
    };
  }
  _styleCallback(obj) {
    const id = generateId();
    this.styles[id] = obj;
    loop(obj, (key) => {
      const value = obj[key];

      if (value.isSignal) {
        const callback = (v) => {
          const target: HTMLElement = document.querySelector(
            `[data-style=${id}]`
          );
          if (target) {
            target.style[key] = v;
          }
        };
        this._registerSignal(value, callback);

        value.subscribe(callback);
      }
    });
    return `data-style=${id}`;
  }
  _propsCallback(name, initialValue) {
    const signal = new Signal(initialValue);
    this.attributes.push({ signal: signal.id, name });

    this._registerSignal(signal);

    return signal;
  }
  _connectedCallback(callback) {
    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, callback);
    this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, () => callback());
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
      this._registerSignal(signal);
      signal.subscribe((value) => {});
    }

    return `${attr}=${signal}`;
  }
  _nodeCallback(signal) {
    this._registerSignal(signal);

    signal.subscribe((value) => {
      const id = signal.id;

      const self = document.querySelector(this.name);

      if (self) {
        setTimeout(() => {
          const node = getComments(self, `node ${id}`);

          if (node.length) {
            loop(node, (n) => {
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

    const callback = (value) => {
      if (Array.isArray(value)) {
        value = new ArrayWrapper(value).data;
      }

      const id = signal.id;
      const self = document.querySelector(this.name);
      if (self) {
        setTimeout(() => {
          const node = getComments(self, `render ${id}`);
          if (node.length) {
            loop(node, (n) => {
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
    };

    signal.subscribe(callback);
    this._registerSignal(signal, callback);

    return `<!--render ${signal.id}-->`;
  }
  _createCustom() {
    this.custom = Custom(this, this.lifecycle);
  }
  _registerSignal(signal, callback?) {
    if (!this.signals[signal.id]) {
      this.signals[signal.id] = { signal, callbacks: [] };
    }

    callback && this.signals[signal.id].callbacks.push(callback);
  }
};

export default Component;
