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
    Component: () => component_default,
    EventBus: () => EventBus,
    Signal: () => Signal,
    render: () => render
  });

  // src/utils/rand.ts
  var initialId = null;
  var idx = 0;
  var generateId = () => {
    if (!initialId) {
      if (typeof window == "undefined" || !window?.crypto?.randomUUID) {
        initialId = Math.random().toString(36).substring(2, 7);
      } else {
        initialId = window.crypto.randomUUID().replaceAll("-", "").substring(0, 5);
      }
    }
    return `x${initialId}${idx++}x`;
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
  var loopAsync = async (array, callback) => {
    if (!array) return;
    async function* asyncIterableArray(array2) {
      for (let i = 0; i < array2.length; i++) {
        yield [array2[i], i];
      }
    }
    async function* asyncIterableObject(obj) {
      for (let key in obj) {
        yield [obj[key], key];
      }
    }
    async function* asyncIterableMap(map) {
      for (let [key, value] of map.entries()) {
        yield [value, key];
      }
    }
    const ctcConstructorName = array.constructor.name;
    for await (let [value, key] of ctcConstructorName == "Array" ? asyncIterableArray(array) : ctcConstructorName == "Object" ? asyncIterableObject(array) : ctcConstructorName == "Map" ? asyncIterableMap(array) : asyncIterableArray(array)) {
      await callback(value, key);
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
      const listeners = this.subscriber[event] || [];
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
        loop(this.subscriber, (value, key) => {
          this.subscriber[key] = [];
        });
      }
    }
    toString() {
      return "";
    }
  };

  // src/consts/component-lifecycle.ts
  var BEFORE_RENDERED = "before_rendered";
  var RENDERED = "rendered";
  var DESTROY = "destroy";
  var CHANGE = "change";
  var ADOPTED = "adopted";
  var COMPONENT_LIFECYCLE = {
    BEFORE_RENDERED,
    RENDERED,
    DESTROY,
    CHANGE,
    ADOPTED
  };

  // src/components-base.ts
  var _GlobalEventBus = class {
    subscriber;
    constructor() {
      this.subscriber = {};
    }
    on(component, event, callback) {
      if (!this.subscriber[component]) {
        this.subscriber[component] = new EventBus();
      }
      this.subscriber[component].on(event, callback);
    }
    broadcast(component, event, data) {
      this.subscriber[component].broadcast(event, data);
    }
    clean(name) {
      if (name) {
        const g = this.subscriber[name];
        if (g) {
          g.clean();
        }
      } else {
        Object.keys(this.subscriber).forEach((key) => {
          this.subscriber[key].clean();
        });
      }
    }
  };
  var GlobalEventBus = new _GlobalEventBus();
  var GlobalHandlers = {};
  var ComponentBase = class {
    name;
    id;
    attributes;
    template;
    callback;
    signals;
    styles;
    eventsStore;
    lifecycle;
    options;
    refs;
    attributeChangePayload;
    globalEventBus;
    globalHandlers;
    destroyTimeout;
    /**
     * Creates an instance of the component with the specified callback and options.
     *
     * @param callback - The callback function to be executed.
     * @param options - An optional object containing additional configuration options.
     *
     * @property {any} callback - The callback function provided during instantiation.
     * @property {string} id - A unique identifier generated for the instance.
     * @property {string} name - A name generated for the instance, prefixed with 'x-'.
     * @property {object} options - The configuration options merged with a default extension of HTMLElement.
     * @property {object} attributes - An object to store attributes.
     * @property {object} template - An object to store template information.
     * @property {object} signals - An object to store signals.
     * @property {object} styles - An object to store styles.
     * @property {Array} eventsStore - An array to store events.
     * @property {object} refs - An object to store references.
     * @property {EventBus} lifecycle - An instance of EventBus to manage lifecycle events.
     */
    constructor(callback, options = {}) {
      this.callback = callback;
      this.id = generateId();
      this.name = `x-${this.id}`;
      this.options = { extension: HTMLElement, ...options };
      this.attributes = {};
      this.signals = {};
      this.styles = {};
      this.eventsStore = [];
      this.refs = {};
      this.attributeChangePayload = {};
      this.lifecycle = new EventBus();
      this.globalEventBus = GlobalEventBus;
      this.globalHandlers = GlobalHandlers;
    }
    /**
     * Initializes the lifecycle events for the component.
     *
     * This method sets up various lifecycle event listeners for the component,
     * including handling changes, rendering, and destruction of the component.
     *
     * - On `COMPONENT_LIFECYCLE.CHANGE`: Updates signal values and triggers attribute callbacks.
     * - On `COMPONENT_LIFECYCLE.RENDERED`: Executes signal callbacks, sets up event listeners,
     *   invokes reference callbacks, and applies styles.
     * - On `COMPONENT_LIFECYCLE.DESTROY`: Cleans up attributes, template, signals, styles, events,
     *   references, and lifecycle listeners.
     *
     * @private
     */
    _initLifecycle() {
      this.lifecycle.on(
        COMPONENT_LIFECYCLE.CHANGE,
        ({ name, oldValue, newValue }, next) => {
          const attrConf = this.attributes[name] || {};
          const signalId = attrConf.signal_id;
          if (!signalId) return;
          const { signal } = this.signals[signalId] || {};
          if (signal) {
            signal.value = newValue;
          }
          if (oldValue != newValue) {
            this.attributeChangePayload[name] = {
              oldValue,
              newValue,
              signal_id: signalId
            };
          }
          next();
        }
      );
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
        clearTimeout(this.destroyTimeout);
        next();
      });
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
        loop(this.signals, (a) => {
          const { signal, callbacks } = a;
          const find = Object.keys(this.attributeChangePayload).find((key) => {
            return this.attributeChangePayload[key].signal_id == signal.id;
          });
          let value = signal.value;
          if (find) {
            value = this.attributeChangePayload[find].newValue;
            delete this.attributeChangePayload[find];
          }
          if (callbacks.length) {
            loop(callbacks, (callback) => {
              callback && callback(value);
            });
          } else {
            if (find) {
              signal.value = value;
            }
          }
        });
        next();
      });
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
        setTimeout(() => {
          loop(this.eventsStore, (event) => {
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
          loop(styles, (value, key) => {
            target.style[key] = value;
          });
        });
        next();
      });
      this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, (el, next) => {
        this.signals = {};
        this.styles = {};
        this.eventsStore = [];
        clearTimeout(this.destroyTimeout);
        this.destroyTimeout = setTimeout(() => {
          this.attributes = {};
          this.lifecycle.clean();
          this.refs = {};
          this.globalHandlers = {};
          this.globalEventBus.clean(this.name);
        }, 2e3);
        next();
      });
    }
    /**
     * Registers a signal to this.signals.
     * When the component is rendered this.signals will be looped
     * to update the value, the value commonly came from the component props/attributes
     *
     * @param signal - The signal object to register.
     * @param callback - Optional. The callback function to be executed when the signal is triggered.
     */
    _registerSignal(signal, callback) {
      if (!this.signals[signal.id]) {
        this.signals[signal.id] = { signal, callbacks: [] };
      }
      callback && this.signals[signal.id].callbacks.push(callback);
    }
    /**
     * Sets the lifecycle value for the component.
     *
     * @param value - The new lifecycle value to be set.
     */
    _setLifecycle(value) {
      this.lifecycle = value;
    }
  };
  var components_base_default = ComponentBase;

  // src/utils/async.ts
  var promisify = (callback, ...args) => {
    return new Promise((resolve, reject) => {
      try {
        if (typeof callback !== "function") {
          throw new Error("First argument must be a function");
        }
        const isAsync = callback.constructor.name === "AsyncFunction";
        if (isAsync) {
          callback.apply(void 0, args).then((resp) => resolve(resp)).catch((err) => reject(err));
        } else {
          const resp = callback.apply(void 0, args);
          resolve(resp);
        }
      } catch (err) {
        reject(err);
      }
    });
  };

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

  // src/component-custom.ts
  var ComponentCustom = class extends components_base_default {
    replaced;
    timeout;
    renderCount;
    webComponentInstance;
    constructor(callback, options = {}) {
      super(callback, options);
      this.callback = callback;
      this.replaced = {};
      this.renderCount = 0;
      this.webComponentInstance = /* @__PURE__ */ new WeakMap();
    }
    /**
     * Creates a custom HTML element based on the provided configuration.
     *
     * This method checks if a custom element with the specified name already exists.
     * If it does, it returns `true`. Otherwise, it defines a new custom element
     * using the provided attributes, options, and lifecycle callbacks.
     *
     * @returns {boolean} - Returns `true` if the custom element is successfully created or already exists.
     */
    createCustomElement() {
      if (customElements.get(this.name)) {
        return true;
      }
      const self = this;
      const CustomElementDefinition = (ext) => class extends ext {
        static observedAttributes = [
          ...[...new Set(Object.keys(self.attributes))],
          "key"
        ];
        constructor() {
          super();
          this._container();
        }
        async connectedCallback() {
          clearTimeout(self.timeout);
          await new Promise(async (res, rej) => {
            self.timeout = setTimeout(() => {
              self.webComponentInstance.set(this, this);
              self._connectedCallback(this, this._container()).then(res()).catch((err) => rej(err));
            }, 50);
          });
        }
        disconnectedCallback() {
          self._disconnectedCallback(this);
        }
        adoptedCallback() {
          self.webComponentInstance.set(this, this);
          self._adoptedCallback(this);
        }
        attributeChangedCallback(name, oldValue, newValue) {
          self._attributeChangedCallback(name, oldValue, newValue);
        }
        _container() {
          if (["open", "closed"].includes(self.options.type)) {
            this.attachShadow({ mode: self.options.type });
            return this.shadowRoot;
          } else {
            return this;
          }
        }
      };
      customElements.define(
        this.name,
        CustomElementDefinition(self.options.extension)
      );
      return true;
    }
    /**
     * Handles the adopted callback for the custom component.
     *
     * This method is called when the custom element is adopted into a new document.
     * It broadcasts the `ADOPTED` lifecycle event with the provided element.
     *
     * @param self - The custom element instance that is being adopted.
     */
    _adoptedCallback(self) {
      this.lifecycle.broadcast(COMPONENT_LIFECYCLE.ADOPTED, self);
    }
    /**
     * Handles the disconnection of the component by broadcasting a destroy event.
     *
     * @param self - The instance of the component that is being disconnected.
     */
    _disconnectedCallback(self) {
      console.log(118, this.webComponentInstance.get(self));
      this.webComponentInstance.delete(self);
      console.log(119, this.webComponentInstance.has(self));
      this.lifecycle.broadcast(COMPONENT_LIFECYCLE.DESTROY, null);
    }
    /**
     * Callback method that is invoked when an attribute of the custom element is added, removed, or changed.
     *
     * @param name - The name of the attribute that was changed.
     * @param oldValue - The previous value of the attribute before the change.
     * @param newValue - The new value of the attribute after the change.
     */
    _attributeChangedCallback(name, oldValue, newValue) {
      this.lifecycle.broadcast(COMPONENT_LIFECYCLE.CHANGE, {
        name,
        oldValue,
        newValue
      });
    }
    /**
     * Handles the connected callback lifecycle event for the custom component.
     *
     * @param self - The instance of the custom component.
     * @param container - The container element where the component's content will be appended.
     * @returns A promise that resolves once the component has been fully rendered and all necessary slots have been processed.
     *
     * @remarks
     * This method performs the following tasks:
     * 1. Replaces the slot content with the component's template.
     * 2. Removes any unused slots from the template.
     * 3. Appends all child nodes of the component and its template to the container.
     * 4. Broadcasts the `COMPONENT_LIFECYCLE.RENDERED` event once rendering is complete.
     */
    async _connectedCallback(self, container) {
      const template = this._templateToHtml();
      if (!template) {
        return;
      }
      await this._replaceSlot(self, template);
      await this._removeUnusedSlotsInTemplate(template);
      await loopAsync(self.childNodes, async (child) => {
        {
          return container.appendChild(child);
        }
      });
      await loopAsync(template.childNodes, async (child) => {
        return container.appendChild(child);
      });
      await this.lifecycle.broadcast(COMPONENT_LIFECYCLE.RENDERED, self);
    }
    /**
     * Asynchronously removes all named slots from the given target element's template.
     *
     * @param target - The target element containing the template with slots to be removed.
     * @returns A promise that resolves when all named slots have been removed.
     */
    async _removeUnusedSlotsInTemplate(target) {
      const targetSlots = target.querySelectorAll("slot[name]");
      await loopAsync(targetSlots, async (slot, i) => slot.remove());
    }
    /**
     * Replaces the slots in the target element with the corresponding slots from the source element.
     *
     * @param src - The source element containing the slots to be copied.
     * @param target - The target element where the slots will be replaced.
     *
     * This method performs the following steps:
     * 1. Selects all elements with a "slot" attribute from the source element.
     * 2. Iterates over each slot and performs the following actions:
     *    - Retrieves the slot name and removes the "slot" attribute from the source slot.
     *    - Finds the corresponding slot in the target element.
     *    - If a corresponding slot is found in the target:
     *      - Copies all attributes (except "name") from the target slot to the source slot.
     *      - Replaces the target slot with the cloned source slot.
     *      - Removes the original source slot.
     *    - If no corresponding slot is found in the target:
     *      - Removes the source slot.
     *
     * This method uses asynchronous operations to handle the slot replacement and attribute copying.
     */
    async _replaceSlot(src, target) {
      const slots = src.querySelectorAll("[slot]");
      await loopAsync(slots, async (slot, i) => {
        const slotName = slot.getAttribute("slot");
        slot.removeAttribute("slot");
        const targetSlot = target.querySelector(`slot[name=${slotName}]`);
        if (targetSlot) {
          const attributes = targetSlot.attributes;
          await loopAsync(attributes, async (attr) => {
            if (attr.name == "name") return;
            slot.setAttribute(attr.name, attr.value);
          });
          await promisify(
            (targetSlot2, slot2) => {
              this.replaced[slotName] = slot2;
              return targetSlot2.replaceWith(slot2.cloneNode(true));
            },
            targetSlot,
            slot
          );
          await promisify((slot2) => slot2.remove(), slot);
        } else {
          await promisify((slot2) => slot2.remove(), slot);
        }
      });
    }
    /**
     * Converts the template to an HTML string.
     *
     * If the template is a function, it will be executed and its result will be converted to HTML.
     * Otherwise, the template itself will be returned.
     *
     * @returns {string} The HTML string representation of the template.
     */
    _templateToHtml() {
      const templateType = typeof this.template;
      if (templateType == "function") {
        const template = this.template();
        const converted = stringToHTML(template);
        return converted;
      } else if (templateType == "string") {
        return stringToHTML(this.template);
      }
    }
  };
  var component_custom_default = ComponentCustom;

  // src/services/signal.ts
  var Signal = class {
    id;
    _value;
    subscribers;
    pubsub;
    constructor(initialValue) {
      this.id = generateId();
      this._value = initialValue;
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
      try {
        return this._value?.toString();
      } catch (e) {
        return String(this._value);
      }
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

  // src/utils/data-wrapper.ts
  var DataWrapper = class {
    /**
     * Creates an instance of DataWrapper.
     * @param ctx - The context or data to be wrapped.
     */
    constructor(ctx) {
      this.ctx = ctx;
      this.ctx = ctx;
    }
    /**
     * Gets the wrapped data.
     * @returns The wrapped data.
     */
    get data() {
      return this.ctx;
    }
    /**
     * Checks if the wrapped data is empty.
     * @returns `true` if the data is empty, otherwise `false`.
     */
    get isEmpty() {
      const type = typeof this.ctx;
      if (!this.ctx) {
        return true;
      }
      if (this.ctx.size !== void 0) {
        return this.ctx.size === 0;
      } else if (this.ctx.length !== void 0) {
        return this.ctx.length === 0;
      }
      if (type === "object") {
        return Object.keys(this.ctx).length === 0;
      }
      return true;
    }
    /**
     * Iterates over the wrapped data and applies a callback function to each element.
     * @param callback - The function to be called for each element. It receives the value and key as arguments.
     * @returns A concatenated string of the results of the callback function.
     */
    each(callback) {
      let str = "";
      loop(this.ctx, (value, key) => {
        str += callback(value, key);
      });
      return str;
    }
  };

  // src/component.ts
  var Component = class extends component_custom_default {
    constructor(callback, options) {
      super(callback, options);
      this.callback = callback;
      const template = this.callback({
        node: this.node.bind(this),
        render: this.render.bind(this),
        attr: this.attr.bind(this),
        events: this.events.bind(this),
        props: this.props.bind(this),
        style: this.style.bind(this),
        ref: this.ref.bind(this),
        signal: this.signal.bind(this),
        onConnected: this.onConnected.bind(this),
        sub: this.sub.bind(this),
        pub: this.pub.bind(this),
        handler: this.handler.bind(this)
      });
      this.template = template;
      this._initLifecycle();
      this.createCustomElement();
    }
    /**
     * It represents the DOM Text Node, It updates the textnode when the signal value changes.
     *
     * @param signal - The signal to be registered and used for DOM updates.
     * @returns A string representing an HTML comment with the signal's ID and value.
     *
     */
    node(signal) {
      this._registerSignal(signal);
      signal.subscribe((value) => {
        const id = signal.id;
        const self = document.querySelector(this.name);
        if (!self) {
          return;
        }
        const node = getComments(self, `node ${id}`);
        if (!node.length) {
          return;
        }
        loop(node, (n) => {
          const next = n.nextSibling;
          if (next.nodeType == 3) {
            if (next.nodeValue[0] == " ") {
              next.nodeValue = ` ${value}`;
            } else {
              next.nodeValue = value.value;
            }
          }
        });
      });
      return `<!--node ${signal.id}--> ${signal}`;
    }
    /**
     * It will render the template with the signal value.
     *  It will replace the content if the template is a string.
     *  It will append the content if the template is a function.
     *  It will render the content with the renderer if provided.
     *  It will return HTML comment with the signal ID.
     *
     * @param ctx
     * @param template
     * @param opts
     * @returns HTML comment with the signal ID.
     */
    render(ctx, template, opts) {
      if (!opts) {
        opts = {};
      }
      const templateType = typeof template;
      if (!ctx?.isSignal) {
        ctx = new Signal(ctx);
      }
      if (opts.replace == void 0) {
        opts.replace = true;
      }
      const callback = (value) => {
        value = new DataWrapper(value);
        const id = ctx.id;
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
              next && next.remove();
            }
          }
          if (!r) {
            return;
          }
          const rHtml = stringToHTML(r);
          n.parentElement.insertBefore(rHtml.firstChild, n.nextSibling);
        });
      };
      ctx.subscribe(callback);
      this._registerSignal(ctx, callback);
      return `<!--render ${ctx.id}-->`;
    }
    /**
     * Updates the attribute of elements based on a signal context.
     *  The attribute will be updated when the signal value changes.
     *  The attribute will be updated for all elements with the specified attribute and context ID.
     *
     * @param attr - The attribute to be updated.
     * @param ctx - The context object containing signal information.
     * @returns The selector string used to identify elements with the specified attribute and context ID.
     */
    attr(attr, ctx) {
      if (!ctx.isSignal) return;
      const sel = `data-${attr}=${ctx.id}`;
      let callback = (value) => {
        setTimeout(() => {
          const targets = document.querySelectorAll(
            `[${sel}]`
          );
          loop(targets, (target) => {
            target.setAttribute(attr, value);
          });
        });
      };
      const keys = Object.keys(this.attributes);
      for (let i = 0; i < keys.length; i++) {
        const conf = this.attributes[keys[i]];
        const { signal_id } = conf;
        if (ctx.id == signal_id) {
          if (!conf.callbacks) {
            conf.callbacks = [];
          }
          conf.callbacks.push(callback);
        }
      }
      this._registerSignal(ctx, callback);
      return sel;
    }
    events(events) {
      let str = "";
      loop(events, (handler, key) => {
        const id = generateId();
        this.eventsStore.push({
          id,
          type: key,
          handler
        });
        str += `data-event=${key}-${id} `;
      });
      return str;
    }
    props(name, initialValue) {
      const signal = new Signal(initialValue);
      this.attributes[name] = { signal_id: signal.id, name };
      return signal;
    }
    style(obj) {
      const id = generateId();
      this.styles[id] = obj;
      loopAsync(obj, async (key) => {
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
        this._registerSignal(value, (value2) => promisify(callback, value2));
        value.subscribe((value2) => promisify(callback, value2));
      });
      return `data-style=${id}`;
    }
    ref(callback) {
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
      console.log(283, this.refs);
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
    signal(value) {
      return new Signal(value);
    }
    onConnected(callback) {
      if (typeof callback !== "function") return;
      const getType = (callback2) => callback2.constructor.name;
      const assignDisconnect = (callback2) => {
        this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, (el, next) => {
          switch (getType(callback2)) {
            case "AsyncFunction": {
              callback2(el).then(next).catch((err) => {
                console.error(err);
                next();
              });
              return;
            }
            case "Function": {
              callback2(el);
              next();
              return;
            }
            default: {
              next();
            }
          }
        });
      };
      this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
        switch (getType(callback)) {
          case "AsyncFunction": {
            callback(el).then((disconnectCallback) => {
              if (typeof disconnectCallback !== "function") return next();
              assignDisconnect(disconnectCallback);
            });
            return;
          }
          case "Function": {
            const disconnectCallback = callback(el);
            if (typeof disconnectCallback !== "function") return next();
            assignDisconnect(disconnectCallback);
            break;
          }
          default: {
            next();
          }
        }
      });
    }
    /**
     * Subscribes to a global event bus with the specified event name and callback function.
     *
     * @param name - The name of the event to subscribe to.
     * @param callback - The function to be called when the event is triggered.
     * @returns A string representing the subscription in the format `data-sub-{name}={this.name}`.
     */
    sub(name, callback) {
      this.globalEventBus.on(this.name, name, callback);
      return `data-sub-${name}=${this.name}`;
    }
    /**
     * Publishes an event to a specified component.
     *
     * @param name - The name of the event to publish.
     * @returns A function that takes data as an argument and broadcasts the event with the provided data,
     *          or undefined if the component or attribute is not found.
     */
    pub(name) {
      const self = document.querySelector(this.name);
      if (!self) return;
      const srcComponent = self.getAttribute(`data-sub-${name}`);
      if (!srcComponent) return;
      return (data) => {
        this.globalEventBus.broadcast(srcComponent, name, data);
      };
    }
    /**
     * Registers or retrieves a global handler function.
     *
     * @param name - The name of the handler.
     * @param callback - An optional callback function to register as the handler.
     *                    If not provided, the function will return the existing handler for the given name.
     * @returns The existing handler function if `callback` is not provided, or `true` if the handler was successfully registered.
     */
    handler(...args) {
      const ctx = args[0];
      const ctxType = typeof ctx;
      if (args.length == 1 && ctxType == "string") {
        const name = args[0];
        const self = document.querySelector(this.name);
        if (!self) return;
        const srcComponent = self.getAttribute(`data-handler-${name}`);
        if (!srcComponent) return;
        if (!this.globalHandlers[srcComponent]) {
          throw new Error(`Handler is not properly set in ${srcComponent}`);
        }
        if (!this.globalHandlers[srcComponent][name]) {
          throw new Error(`Handler ${name} not found in ${srcComponent}`);
        }
        return this.globalHandlers[srcComponent][name];
      }
      if (!this.globalHandlers[this.name]) {
        this.globalHandlers[this.name] = {};
      }
      switch (ctxType) {
        case "string": {
          const [name, callback] = args;
          this.globalHandlers[this.name][name] = callback;
          return `data-handler-${name}=${this.name}`;
        }
        case "object": {
          let str = "";
          loop(ctx, (callback, name) => {
            this.globalHandlers[this.name][name] = callback;
            str += `data-handler-${name}=${this.name} `;
          });
          return str;
        }
      }
      return "";
    }
  };
  var component_default = Component;

  // src/blueprint.ts
  var Blueprint = class {
    callback;
    current;
    options;
    /**
     * Creates an instance of the class.
     *
     * @param callback - A function that takes the parameters of the Component prototype.
     * @param options - An optional parameter of type ComponentOptionType. Defaults to an empty object.
     */
    constructor(callback, options = {}) {
      this.callback = callback;
      this.current = null;
      this.options = options || {};
    }
    /**
     * Builds a new component instance using the provided callback and options.
     *
     * @returns {string} The name of the newly created component.
     */
    build() {
      this.current = new component_default(this.callback, this.options);
      return this.current;
    }
    /**
     * Converts the current object to a string representation.
     *
     * @returns {string} The string representation of the current object.
     */
    toString() {
      this.build();
      return this.current.name;
    }
    /**
     * Getter for the `close` property.
     *
     * @returns {string} The name of the current object.
     */
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
//# sourceMappingURL=index.iife.js.map
