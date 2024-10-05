import ComponentCustom from "./component-custom";
import ComponentBase from "./components-base";
import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";
import EventBus from "./services/event-bus";
import Signal from "./services/signal";
import DataWrapper from "./utils/data-wrapper";
import { getComments, stringToHTML } from "./utils/el";
import { loop, loopAsync } from "./utils/loop";
import { generateId } from "./utils/rand";

import { ComponentOptionType } from "./types";
import { promisify } from "./utils/async";

class Component extends ComponentCustom {
  constructor(callback, options: ComponentOptionType) {
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
      handler: this.handler.bind(this),
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
  node(signal: Signal): string {
    this._registerSignal(signal);

    signal.subscribe((value) => {
      const id = signal.id;

      const self = document.querySelector(this.name);

      if (!self) {
        return;
      }

      const node: any[] = getComments(self, `node ${id}`);

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

    // this._registerSignal(signal);

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
  render(
    ctx: any,
    template: (params: DataWrapper) => string,
    opts?: {
      replace?: boolean;
      renderer?: {
        render: Function;
      };
    }
  ): string {
    if (!opts) {
      opts = {};
    }
    const templateType = typeof template;

    /**
     * allow even if not a signal,
     * if so, create a signal.
     */
    if (!ctx?.isSignal) {
      ctx = new Signal(ctx);
    }

    if (opts.replace == undefined) {
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
            list: value,
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
        const targets: NodeListOf<Element> = document.querySelectorAll(
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
      //
      const { signal_id } = conf;
      if (ctx.id == signal_id) {
        if (!conf.callbacks) {
          conf.callbacks = [];
        }

        conf.callbacks.push(callback);
        // break;
      }
    }

    // ctx.subscribe(callback);

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
        handler,
      });
      str += `data-event=${key}-${id} `;
    });

    return str;
  }
  props(name, initialValue) {
    const signal = new Signal(initialValue);

    this.attributes[name] = { signal_id: signal.id, name };

    // console.log(261, this.callback, name, signal.id, this.attributes[name]);

    return signal;
  }
  style(obj) {
    const id = generateId();
    this.styles[id] = obj;
    loopAsync(obj, async (key) => {
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
      this._registerSignal(value, (value) => promisify(callback, value));

      value.subscribe((value) => promisify(callback, value));
    });
    return `data-style=${id}`;
  }
  ref(callback?) {
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
  signal<T>(value) {
    return new Signal(value) as T;
  }
  onConnected(callback) {
    if (typeof callback !== "function") return;
    const getType = (callback) => callback.constructor.name;
    const assignDisconnect = (callback) => {
      this.lifecycle.on(COMPONENT_LIFECYCLE.DESTROY, (el, next) => {
        switch (getType(callback)) {
          case "AsyncFunction": {
            callback(el)
              .then(next)
              .catch((err) => {
                console.error(err);
                next();
              });
            return;
          }
          case "Function": {
            callback(el);
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
    //getter
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

    //setter

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
}

export default Component;
