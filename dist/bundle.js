var Kwik = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Blueprint: () => Blueprint,
    Component: () => components_default,
    EventBus: () => EventBus,
    Signal: () => Signal,
    render: () => render
  });

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
      loop(this.component.events, (event) => {
        const { type, id, handler } = event;
        const target = html.querySelector(
          `[data-event=${type}-${id}]`
        );
        if (target) {
          target.addEventListener(type, (e) => {
            handler(e);
          });
        }
      });
      return { str, html };
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
    const id = component.id, name = component.name, attributes = component.attributes.map((item) => item.name), template = component.template;
    let vdom = new JSXProcess(component);
    let tempalateHtml = null;
    let initialInnerHtml = "";
    if (customElements.get(name)) {
      return customElements.get(name);
    }
    customElements.define(
      name,
      class extends HTMLElement {
        static observedAttributes = [...attributes, "key"];
        constructor() {
          super();
          initialInnerHtml = stringToHTML(this.innerHTML);
          this.innerHTML = "";
        }
        connectedCallback() {
          if (typeof template == "function") {
            const { str, html } = vdom.toHtml();
            tempalateHtml = html;
          } else {
            tempalateHtml = template;
          }
          this._replaceSlot(initialInnerHtml, tempalateHtml);
          loop(initialInnerHtml.childNodes, (child) => this.appendChild(child));
          loop(tempalateHtml.childNodes, (child) => this.appendChild(child));
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
        }
      }
    );
    return customElements.get(name);
  };
  var custom_default = Custom;

  // src/utils/rand.ts
  var generateId = () => `a${crypto.randomUUID().replaceAll("-", "")}a`;

  // src/utils/array.ts
  var ArrayWrapper = class {
    constructor(array) {
      this.array = array;
      this.array = array;
    }
    get data() {
      if (Array.isArray(this.array)) {
        return this;
      } else {
        return this.array;
      }
    }
    each(callback) {
      return this.array.map(callback).join("");
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
      loop(this.subscriber[event], (callback) => {
        callback(data);
      });
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
      this._value = v;
      this._notify();
    }
    subscribe(subscriber) {
      this.pubsub.on("signal", subscriber);
    }
    toString() {
      return this._value.toString();
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
    constructor(callback) {
      this.callback = callback;
      this.id = generateId();
      this.name = `x-${this.id}`;
      this.attributes = [];
      this.template = {};
      this.signals = {};
      this.styles = {};
      this.events = [];
      this.lifecycle = new EventBus();
      this._initLifecycle();
      this._createTemplate();
      this._createCustom();
    }
    _initLifecycle() {
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el) => {
        loop(this.styles, (styles, id) => {
          const target = document.querySelector(
            `[data-style=${id}]`
          );
          if (!target) return;
          loop(styles, (key) => {
            target.style[key] = styles[key];
          });
        });
      });
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el) => {
        loop(this.signals, (a) => {
          const { signal, callbacks } = a;
          if (!callbacks.length) return;
          loop(callbacks, (callback) => {
            callback && callback(signal.value);
          });
        });
      });
      this.lifecycle.on(
        COMPONENT_LIFECYCLE.CHANGE,
        ({ name, oldValue, newValue }) => {
          const getSignalId = this.attributes.find((item) => item.name == name);
          if (!getSignalId) return;
          const conf = this.signals[getSignalId?.signal];
          if (oldValue != newValue) {
            conf.signal.value = newValue;
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
        onConnected: this._connectedCallback.bind(this)
      });
      this.template = template;
    }
    _refCallback(callback) {
      const id = generateId();
      if (!callback) return;
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, () => {
        const target = document.querySelector(`[data-ref=${id}]`);
        callback(target);
      });
      return {
        get current() {
          return document.querySelector(`[data-ref=${id}]`);
        },
        toString() {
          return `data-ref=${id}`;
        }
      };
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
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, callback);
      this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, () => callback());
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
      this._registerSignal(signal);
      signal.subscribe((value) => {
      });
      return `${attr}=${signal}`;
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
      if (opts.replace == void 0) {
        opts.replace = templateType == "string" ? true : false;
      }
      const callback = (value) => {
        if (Array.isArray(value)) {
          value = new ArrayWrapper(value).data;
        }
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
          let r = null;
          switch (templateType) {
            case "string":
              {
                if (opts.renderer) {
                  r = opts.renderer.render(template, {
                    list: value
                  });
                } else {
                  throw new Error("renderer is required");
                }
              }
              break;
            case "function":
              {
                r = template(value);
              }
              break;
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
    /**
     * @param {(params: ParamsType) => void} callback - The callback function that accepts an object with methods `node`, `attr`, and `signal`.
     */
    constructor(callback) {
      this.callback = callback;
      this.current = null;
    }
    build() {
      this.current = new components_default(this.callback);
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
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=bundle.js.map
