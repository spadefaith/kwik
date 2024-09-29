// src/utils/el.ts
var getComments = (node, target) => {
  const xPath = "//comment()", result = [];
  let query = document.evaluate(
    xPath,
    node,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    const item = query.snapshotItem(i);
    if (target) {
      if (target == item.nodeValue) {
        result.push(item);
      }
    } else {
      result.push(item);
    }
  }
  return result;
};
var stringToHTML = (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");
  return doc.body;
};

// src/services/jsx.ts
var JSXProcess = class {
  renderFunction;
  component;
  jsx;
  events;
  signals;
  constructor(component) {
    this.component = component;
    const ctx = component.template;
    this.renderFunction = null;
    if (typeof ctx == "function") {
      this.renderFunction = ctx;
      this.jsx = ctx();
    } else {
      this.jsx = ctx;
    }
  }
  toHtml() {
    const str = this.jsx;
    const html = stringToHTML(str);
    return { str, html };
  }
};

// src/utils/loop.ts
var loop = (array, callback) => {
  if (!array) return;
  switch (array.constructor.name) {
    case "Array": {
      for (let i = 0; i < array.length; i++) {
        callback(array[i], i);
      }
      break;
    }
    case "Object": {
      for (let key in array) {
        callback(array[key], key);
      }
      break;
    }
    case "Map": {
      for (let [key, value] of array.entries()) {
        callback(value, key);
      }
      break;
    }
    default: {
      if (array.length) {
        for (let i = 0; i < array.length; i++) {
          callback(array[i], i);
        }
      }
    }
  }
};

// src/consts/component-lifecycle.ts
var RENDERED = "rendered";
var DESTROY = "destroy";
var CHANGE = "change";
var ADOPTED = "adopted";
var COMPONENT_LIFECYCLE = { RENDERED, DESTROY, CHANGE, ADOPTED };

// src/services/custom.ts
var Custom = (component, lifecycle) => {
  const id = component.id, name = component.name, attributes = component.attributes.map((item) => item.name), extension = component.extension || HTMLElement, customType = component.customType, template = component.template;
  let vdom = new JSXProcess(component);
  let tempalateHtml = null;
  let initialInnerHtml = "";
  if (customElements.get(name)) {
    return customElements.get(name);
  }
  const classFactory = (ext) => {
    return class extends ext {
      static observedAttributes = [...attributes, "key"];
      constructor() {
        super();
        initialInnerHtml = stringToHTML(this.innerHTML);
        this._container();
      }
      connectedCallback() {
        if (typeof template == "function") {
          const { str, html } = vdom.toHtml();
          tempalateHtml = html;
        } else {
          tempalateHtml = template;
        }
        this._replaceSlot(initialInnerHtml, tempalateHtml);
        loop(initialInnerHtml.childNodes, (child) => {
          this._container().appendChild(child);
        });
        loop(
          tempalateHtml.childNodes,
          (child) => this._container().appendChild(child)
        );
        lifecycle.broadcast(COMPONENT_LIFECYCLE.RENDERED, this);
      }
      disconnectedCallback() {
        lifecycle.broadcast(COMPONENT_LIFECYCLE.DESTROY, this);
      }
      adoptedCallback() {
        lifecycle.broadcast(COMPONENT_LIFECYCLE.ADOPTED, this);
      }
      attributeChangedCallback(name2, oldValue, newValue) {
        lifecycle.broadcast(COMPONENT_LIFECYCLE.CHANGE, {
          name: name2,
          oldValue,
          newValue
        });
      }
      _replaceSlot(src, target) {
        const slots = src.querySelectorAll("[slot]");
        loop(slots, (slot, i) => {
          const slotName = slot.getAttribute("slot");
          const targetSlot = target.querySelector(`slot[name=${slotName}]`);
          if (targetSlot) {
            const attributes2 = targetSlot.attributes;
            loop(attributes2, (attr) => {
              if (attr.name == "name") return;
              slot.setAttribute(attr.name, attr.value);
            });
            slot.removeAttribute("slot");
            targetSlot.replaceWith(slot);
          } else {
            slot.remove();
          }
        });
        const targetSlots = target.querySelectorAll("slot[name]");
        loop(targetSlots, (slot, i) => slot.remove());
        loop(this.childNodes, (child) => {
          if (child.nodeType == 1 && child.getAttribute("slot")) {
            child.remove();
          }
        });
      }
      _container() {
        if (["open", "closed"].includes(customType)) {
          this.attachShadow({ mode: customType });
          return this.shadowRoot;
        } else {
          return this;
        }
      }
    };
  };
  customElements.define(name, classFactory(extension));
  return customElements.get(name);
};
var custom_default = Custom;

// src/utils/rand.ts
var generateId = () => `a${crypto.randomUUID().replaceAll("-", "")}a`;

// src/utils/data-wrapper.ts
var DataWrapper = class {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx = ctx;
  }
  get data() {
    return this.ctx;
  }
  get isEmpty() {
    const type = typeof this.ctx;
    if (!this.ctx) {
      return true;
    } else if (type === "object") {
      return Object.keys(this.ctx).length === 0;
    }
    return this.ctx.length == 0 || this.ctx.size == 0;
  }
  each(callback) {
    let str = "";
    loop(this.ctx, (value, key) => {
      str += callback(value, key);
    });
    return str;
  }
};

// src/services/event-bus.ts
var EventBus = class {
  subscriber;
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
    const length = listeners.length;
    let index = 0;
    const recur = (listeners2) => {
      if (listeners2.length > index) {
        let callback = listeners2[index];
        callback(data, () => {
          index++;
          recur(listeners2);
        });
      }
      if (listeners2.length - 1 == index) {
      }
    };
    recur(listeners);
  }
  clean(event) {
    if (event) {
      this.subscriber[event] && (this.subscriber[event] = []);
    } else {
      loop(this.subscriber, (event2) => {
        this.subscriber[event2] = [];
      });
    }
  }
};

// src/services/signal.ts
var Signal = class {
  id;
  _value;
  subscribers;
  pubsub;
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
    const test = this._checkEquality(this._value, v);
    if (test) {
      return;
    }
    this._value = v;
    this._notify();
  }
  subscribe(subscriber) {
    this.pubsub.on("signal", (data, next) => {
      subscriber(data);
      next();
    });
  }
  toString() {
    return this._value.toString();
  }
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
  get isSignal() {
    return true;
  }
};

// src/components.ts
var Component = class {
  name;
  id;
  attributes;
  template;
  callback;
  custom;
  componentCallback;
  componentDisconnectCallback;
  signals;
  styles;
  events;
  lifecycle;
  props;
  options;
  refs;
  extension;
  customType;
  constructor(callback, options = {}) {
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
          const { type, id, handler } = event;
          const target = el.querySelector(
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
        const target = document.querySelector(
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
      signal: (value) => {
        return new Signal(value);
      },
      onConnected: this._connectedCallback.bind(this)
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
        const target = document.querySelector(
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
  _refCallback(callback) {
    const id = generateId();
    if (callback) {
      const cb = (self) => {
        setTimeout(() => {
          const target = self.querySelector(`[data-ref=${id}]`);
          if (target) {
            this.refs[id].is_rendered = true;
          }
          callback(target);
        });
      };
      this.refs[id] = {
        callback: cb,
        is_rendered: false
      };
    }
    const $this = this;
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
      }
    };
  }
  _eventsCallback(events) {
    let str = "";
    loop(events, (handler, key) => {
      const id = generateId();
      this.events.push({
        id,
        type: key,
        handler
      });
      str += `data-event=${key}-${id} `;
    });
    return str;
  }
  _attrCallback(attr, signal) {
    if (!signal.isSignal) return;
    this._registerSignal(signal, () => {
    });
    return `${attr}=${signal}`;
  }
  _attrDataCallback(attr, signal) {
    if (!signal.isSignal) return;
    this._registerSignal(signal, () => {
    });
    return `data-${attr}=${signal}`;
  }
  _nodeCallback(signal) {
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
  _renderCallback(signal, template, opts = {}) {
    const templateType = typeof template;
    if (!signal?.isSignal) {
      signal = new Signal(signal);
    }
    if (opts.replace == void 0) {
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
            list: value
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
    this.custom = custom_default(this, this.lifecycle);
  }
  _registerSignal(signal, callback) {
    if (!this.signals[signal.id]) {
      this.signals[signal.id] = { signal, callbacks: [] };
    }
    callback && this.signals[signal.id].callbacks.push(callback);
  }
};
var components_default = Component;

// src/blueprint.ts
var Blueprint = class {
  callback;
  current;
  extension;
  customType;
  constructor(callback, options = {}) {
    this.callback = callback;
    this.current = null;
    this.extension = options.extension;
    this.customType = options.type;
  }
  build() {
    this.current = new components_default(this.callback, {
      extension: this.extension,
      type: this.customType
    });
    return this.current.name;
  }
  toString() {
    return this.build();
  }
  get close() {
    return this.current.name;
  }
};

// src/utils/append.ts
function render(target, component) {
  target.innerHTML = "";
  target.appendChild(document.createElement(`${component}`));
}
export {
  Blueprint,
  components_default as Component,
  EventBus,
  Signal,
  render
};
