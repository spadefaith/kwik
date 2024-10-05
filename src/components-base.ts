import { generateId } from "./utils/rand";
import EventBus from "./services/event-bus";
import Signal from "./services/signal";
import { loop } from "./utils/loop";
import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";
import { ComponentOptionType } from "./types";
export type AttributesItemType = {
  [key: string]: {
    signal_id: string;
    name: string;
    callbacks?: (a: any) => any;
  };
};

export type SignalItemType = {
  [key: string]: {
    signal: Signal;
    callbacks?: ((a: any) => any)[];
  };
};

class _GlobalEventBus {
  subscriber: any;
  constructor() {
    this.subscriber = {};
  }
  on(component: string, event: string, callback: (props?: any) => any) {
    if (!this.subscriber[component]) {
      this.subscriber[component] = new EventBus();
    }
    this.subscriber[component].on(event, callback);
  }
  broadcast(component, event, data) {
    this.subscriber[component].broadcast(event, data);
  }

  clean(name?) {
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
}

/**
 * singleton instance of GlobalEventBus
 */
const GlobalEventBus = new _GlobalEventBus();

const GlobalHandlers = {};

class ComponentBase {
  name: string;
  id: string;
  attributes: object;
  template: (props?: any) => string;
  callback: any;
  signals: SignalItemType;
  styles: any;
  eventsStore: any;
  lifecycle: EventBus;
  options: ComponentOptionType;
  refs: any;
  attributeChangePayload: object;
  globalEventBus: _GlobalEventBus;
  globalHandlers: object;
  destroyTimeout: number;

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
  constructor(callback: any, options = {} as any) {
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
          /**
           * stores the updated attributes temporarily
           * later on this value will be used to update
           * the signal
           */
          this.attributeChangePayload[name] = {
            oldValue,
            newValue,
            signal_id: signalId,
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
          /**
           * when the signal is present in this.attributeChangePayload
           * the new value will be used as value for signal;
           * then delete that value;
           */
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

      /**
       * this will clear the remaining storage
       * at 2 seconds after the component is destroyed
       */
      clearTimeout(this.destroyTimeout);
      this.destroyTimeout = setTimeout(() => {
        this.attributes = {};
        this.lifecycle.clean();
        this.refs = {};
        if (this.globalHandlers[this.name]) {
          this.globalHandlers[this.name] = {};
        }

        this.globalEventBus.clean(this.name);
      }, 2000);

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
  _registerSignal(signal, callback?) {
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
}

export default ComponentBase;
