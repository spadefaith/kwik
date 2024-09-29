import Custom from "./services/custom";
import { generateId } from "./utils/rand";
import { getComments, stringToHTML } from "./utils/el";
import DataWrapper from "./utils/data-wrapper";
import EventBus from "./services/event-bus";
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

export type CallbackParameterType = {
  node: (signal: Signal) => string;
  render: (signal: Signal, template: any, opts?: any) => any;
  attr: (attr: string, signal: Signal) => any;
  events: (events: any) => any;
  props: (name: string, initialValue: any) => any;
  style: (obj: any) => any;
  ref: (callback?: (el: HTMLElement) => any) => any;
  signal: (value: any) => Signal;
  onConnected: (callback: () => any) => any;
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
  lifecycle: EventBus;
  props: any;
  options: any;
  refs: any;
  extension: HTMLElement;
  customType: "open" | "closed" | null;
  constructor(
    callback: (params: CallbackParameterType) => any,
    options = {} as any
  ) {
    this.callback = callback;
    this.id = generateId();
    this.name = `x-${this.id}`;
    this.extension = options.extension;
    this.customType = options.type;

    this.attributes = [];
    this.template = {};
    this.signals = {};
    this.styles = {};
    this.events = [];
    this.refs = {};

    this.lifecycle = new EventBus();
    this._initLifecycle();
    this._createTemplate();
    this._createCustom();
  }
  _initLifecycle() {
    this.lifecycle.on(
      COMPONENT_LIFECYCLE.CHANGE,
      ({ name, oldValue, newValue }, next) => {
        const getSignalId = this.attributes.find((item) => item.name == name);
        if (!getSignalId) return;

        const conf = this.signals[getSignalId?.signal];
        if (oldValue != newValue) {
          conf.signal.value = newValue;
        }

        next();
      }
    );

    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
      loop(this.signals, (a) => {
        const { signal, callbacks } = a;
        if (!callbacks.length) return;
        loop(callbacks, (callback) => {
          callback && callback(signal.value);
        });
      });

      next();
    });

    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
      setTimeout(() => {
        loop(this.events, (event) => {
          // console.log(104, event);
          const { type, id, handler } = event;
          const target: HTMLElement = el.querySelector(
            `[data-event=${type}-${id}]`
          );

          if (target) {
            target.addEventListener(type, (e) => {
              handler(e);
            });
          }
        });
      });

      next();
    });

    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
      loop(this.refs, (ref, key) => {
        if (!ref.is_rendered) {
          ref.callback(el);
        }
      });
      next();
    });

    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
      loop(this.styles, (styles, id) => {
        const target: HTMLElement = document.querySelector(
          `[data-style=${id}]`
        );
        if (!target) return;
        loop(styles, (key) => {
          target.style[key] = styles[key];
        });
      });

      next();
    });

    this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, (el, next) => {
      this.attributes = [];
      this.template = {};
      this.signals = {};
      this.styles = {};
      this.events = [];
      this.refs = {};

      next();
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
      signal: <T>(value) => {
        return new Signal(value) as T;
      },
      onConnected: this._connectedCallback.bind(this),
    });

    this.template = template;
  }

  _styleCallback(obj) {
    const id = generateId();
    this.styles[id] = obj;
    loop(obj, (key) => {
      const value = obj[key];

      if (!value.isSignal) return;
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
    this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
      callback(el);
      next();
    });
    this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, (el, next) => () => {
      callback(el);
      next();
    });
  }
  _refCallback(callback?) {
    const id = generateId();
    if (callback) {
      const cb = (self) => {
        setTimeout(() => {
          const target: HTMLElement = self.querySelector(`[data-ref=${id}]`);
          if (target) {
            this.refs[id].is_rendered = true;
          }
          callback(target);
        });
      };

      this.refs[id] = {
        callback: cb,
        is_rendered: false,
      };
    }

    const $this: any = this;
    return {
      get current() {
        const self = document.querySelector($this.name);
        if (!self) {
          return null;
        }
        const target = self.querySelector(`[data-ref=${id}]`);

        return target;
      },
      toString() {
        return `data-ref=${id}`;
      },
    };
  }
  _eventsCallback(events) {
    let str = "";

    loop(events, (handler, key) => {
      const id = generateId();
      this.events.push({
        id,
        type: key,
        handler,
      });
      str += `data-event=${key}-${id} `;
    });

    return str;
  }
  _attrCallback(attr, signal) {
    if (!signal.isSignal) return;
    this._registerSignal(signal, () => {});
    return `${attr}=${signal}`;
  }
  _attrDataCallback(attr, signal) {
    if (!signal.isSignal) return;
    this._registerSignal(signal, () => {});

    return `data-${attr}=${signal}`;
  }
  _nodeCallback(signal: Signal) {
    this._registerSignal(signal);

    signal.subscribe((value) => {
      const id = signal.id;

      const self = document.querySelector(this.name);

      if (!self) {
        return;
      }

      setTimeout(() => {
        const node = getComments(self, `node ${id}`);

        if (!node.length) {
          return;
        }

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
      });
    });

    return `<!--node ${signal.id}--> ${signal}`;
  }
  _renderCallback(
    signal,
    template: (params: DataWrapper) => string,
    opts: any = {}
  ) {
    const templateType = typeof template;

    /**
     * allow even if not a signal,
     * if so, create a signal.
     */
    if (!signal?.isSignal) {
      signal = new Signal(signal);
    }

    if (opts.replace == undefined) {
      opts.replace = templateType == "string" ? true : false;
    }

    const callback = (value) => {
      value = new DataWrapper(value);

      const id = signal.id;
      const self = document.querySelector(this.name);

      if (!self) {
        return;
      }

      const node = getComments(self, `render ${id}`);
      if (!node.length) {
        return;
      }
      loop(node, (n) => {
        let r = template(value);

        if (opts.renderer) {
          r = opts.renderer.render(r, {
            list: value,
          });
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
    };

    signal.subscribe((value) => setTimeout(() => callback(value)));
    this._registerSignal(signal, (value) => setTimeout(() => callback(value)));

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
