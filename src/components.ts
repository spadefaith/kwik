import Custom from "./services/custom";
import { generateId } from "./utils/rand";
import createSignal from "./services/signal";
import { getComments, stringToHTML } from "./utils/el";
import ArrayWrapper from "./utils/array";

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
  constructor(callback) {
    this.callback = callback;
    this.id = generateId();
    this.name = `x-${this.id}`;

    this.attributes = [];
    this.template = {};
    this.signals = {};
    this.styles = {};
    this.events = [];
    this._createTemplate();
    this._createCustom();
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
    this.componentCallback = callback;
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
    this.custom = Custom(this, {
      updateCallback: (el) => {},
      connectedCallback: (el) => {
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

        if (this.componentCallback) {
          this.componentDisconnectCallback = this.componentCallback(el);
        }
      },
      disconnectedCallback: () => {
        this.componentDisconnectCallback && this.componentDisconnectCallback();
      },
      attributeChangedCallback: (attr, oldValue, newValue) => {
        if (this.signals[attr]) {
          this.signals[attr].forEach((signal) => {
            if (oldValue != newValue) {
              signal.value = newValue;
            }
          });
        }
      },
    });
  }
  _registerSignal(name, signal) {
    if (!this.signals[name]) {
      this.signals[name] = [];
    }
    this.signals[name].push(signal);
  }
};

export default Component;
