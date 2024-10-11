import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";
import Signal from "./services/signal";
import { promisify } from "./utils/async";
import DataWrapper from "./utils/data-wrapper";
import { getComments, stringToHTML } from "./utils/el";
import { loop, loopAsync } from "./utils/loop";
import { generateId } from "./utils/rand";

export function node(signal: Signal): string {
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

export function render(
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

export function attr(attr, ctx) {
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

export function events(events) {
  let str = "";

  loop(events, (handler, key) => {
    const id = generateId();

    this.globalEvents[id] = { type: key, handler, id };

    str += `data-event=${key}-${id} `;
  });

  return str;
}

export function props(name, initialValue) {
  const signal = new Signal(initialValue);

  this.attributes[name] = { signal_id: signal.id, name };

  // console.log(261, this.callback, name, signal.id, this.attributes[name]);

  return signal;
}

export function style(obj) {
  const id = generateId();
  this.styles[id] = obj;
  loopAsync(obj, async (key) => {
    const value = obj[key];

    if (!value.isSignal) return;
    const callback = (v) => {
      const target: HTMLElement = document.querySelector(`[data-style=${id}]`);
      if (target) {
        target.style[key] = v;
      }
    };
    this._registerSignal(value, (value) => promisify(callback, value));

    value.subscribe((value) => promisify(callback, value));
  });
  return `data-style=${id}`;
}

export function ref(callback?) {
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

export function signal<T>(value) {
  return new Signal(value) as T;
}

export function onConnected(callback) {
  if (typeof callback !== "function") return;
  const getType = (callback) => callback.constructor.name;
  const assignDisconnect = (callback, _next) => {
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

    _next();
  };

  this.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, (el, next) => {
    switch (getType(callback)) {
      case "AsyncFunction": {
        callback(el).then((disconnectCallback) => {
          if (typeof disconnectCallback !== "function") return next();
          assignDisconnect(disconnectCallback, next);
        });
        return;
      }
      case "Function": {
        const disconnectCallback = callback(el);
        if (typeof disconnectCallback !== "function") return next();
        assignDisconnect(disconnectCallback, next);
        break;
      }
      default: {
        next();
      }
    }
  });
}

export function sub(name, callback) {
  this.globalEventBus.on(this.name, name, callback);
  return `data-sub-${name}=${this.name}`;
}

export function pub(name) {
  const self = document.querySelector(this.name);
  if (!self) return;
  const srcComponent = self.getAttribute(`data-sub-${name}`);
  if (!srcComponent) return;
  return (data) => {
    this.globalEventBus.broadcast(srcComponent, name, data);
  };
}

export function handler(...args) {
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
