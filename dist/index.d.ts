declare module 'kwikjs/blueprint' {
  import Component from "kwikjs/component";
  import { ComponentOptionType } from "kwikjs/types/index";
  /**
   * Represents a blueprint for creating a component.
   *
   * @remarks
   * This class is used to create and manage a component instance using a callback function and optional parameters.
   *
   * @example
   * ```typescript
   * const blueprint = new Blueprint((params) => {
   *   // Initialize component with params
   * }, { option1: 'value1' });
   *
   * const componentName = blueprint.build();
   * console.log(componentName);
   * ```
   *
   * @public
   */
  export default class Blueprint {
      callback: any;
      current: any;
      options: ComponentOptionType;
      /**
       * Creates an instance of the class.
       *
       * @param callback - A function that takes the parameters of the Component prototype.
       * @param options - An optional parameter of type ComponentOptionType. Defaults to an empty object.
       */
      constructor(callback: (params: typeof Component.prototype) => void, options?: ComponentOptionType);
      /**
       * Builds a new component instance using the provided callback and options.
       *
       * @returns {string} The name of the newly created component.
       */
      build(): any;
      /**
       * Converts the current object to a string representation.
       *
       * @returns {string} The string representation of the current object.
       */
      toString(): any;
      /**
       * Getter for the `close` property.
       *
       * @returns {string} The name of the current object.
       */
      get close(): any;
  }

}
declare module 'kwikjs/component-custom' {
  import ComponentBase from "kwikjs/components-base";
  class ComponentCustom extends ComponentBase {
      replaced: any;
      timeout: number;
      renderCount: number;
      constructor(callback: any, options?: any);
      /**
       * Creates a custom HTML element based on the provided configuration.
       *
       * This method checks if a custom element with the specified name already exists.
       * If it does, it returns `true`. Otherwise, it defines a new custom element
       * using the provided attributes, options, and lifecycle callbacks.
       *
       * @returns {boolean} - Returns `true` if the custom element is successfully created or already exists.
       */
      createCustomElement(): boolean;
      /**
       * Handles the adopted callback for the custom component.
       *
       * This method is called when the custom element is adopted into a new document.
       * It broadcasts the `ADOPTED` lifecycle event with the provided element.
       *
       * @param self - The custom element instance that is being adopted.
       */
      _adoptedCallback(self: any): void;
      /**
       * Handles the disconnection of the component by broadcasting a destroy event.
       *
       * @param self - The instance of the component that is being disconnected.
       */
      _disconnectedCallback(self: any): void;
      /**
       * Callback method that is invoked when an attribute of the custom element is added, removed, or changed.
       *
       * @param name - The name of the attribute that was changed.
       * @param oldValue - The previous value of the attribute before the change.
       * @param newValue - The new value of the attribute after the change.
       */
      _attributeChangedCallback(name: any, oldValue: any, newValue: any): void;
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
      _connectedCallback(self: any, container: any): Promise<void>;
      /**
       * Asynchronously removes all named slots from the given target element's template.
       *
       * @param target - The target element containing the template with slots to be removed.
       * @returns A promise that resolves when all named slots have been removed.
       */
      _removeUnusedSlotsInTemplate(target: any): Promise<void>;
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
      _replaceSlot(src: any, target: any): Promise<void>;
      /**
       * Converts the template to an HTML string.
       *
       * If the template is a function, it will be executed and its result will be converted to HTML.
       * Otherwise, the template itself will be returned.
       *
       * @returns {string} The HTML string representation of the template.
       */
      _templateToHtml(): HTMLElement;
  }
  export default ComponentCustom;

}
declare module 'kwikjs/component' {
  import ComponentCustom from "kwikjs/component-custom";
  import Signal from "kwikjs/services/signal";
  import DataWrapper from "kwikjs/utils/data-wrapper";
  import { ComponentOptionType } from "kwikjs/types/index";
  class Component extends ComponentCustom {
      constructor(callback: any, options: ComponentOptionType);
      /**
       * It represents the DOM Text Node, It updates the textnode when the signal value changes.
       *
       * @param signal - The signal to be registered and used for DOM updates.
       * @returns A string representing an HTML comment with the signal's ID and value.
       *
       */
      node(signal: Signal): string;
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
      render(ctx: any, template: (params: DataWrapper) => string, opts?: {
          replace?: boolean;
          renderer?: {
              render: Function;
          };
      }): string;
      /**
       * Updates the attribute of elements based on a signal context.
       *  The attribute will be updated when the signal value changes.
       *  The attribute will be updated for all elements with the specified attribute and context ID.
       *
       * @param attr - The attribute to be updated.
       * @param ctx - The context object containing signal information.
       * @returns The selector string used to identify elements with the specified attribute and context ID.
       */
      attr(attr: any, ctx: any): string;
      events(events: any): string;
      props(name: any, initialValue: any): Signal;
      style(obj: any): string;
      ref(callback?: any): {
          readonly current: any;
          toString(): string;
      };
      signal<T>(value: any): T;
      onConnected(callback: any): void;
      /**
       * Subscribes to a global event bus with the specified event name and callback function.
       *
       * @param name - The name of the event to subscribe to.
       * @param callback - The function to be called when the event is triggered.
       * @returns A string representing the subscription in the format `data-sub-{name}={this.name}`.
       */
      sub(name: any, callback: any): string;
      /**
       * Publishes an event to a specified component.
       *
       * @param name - The name of the event to publish.
       * @returns A function that takes data as an argument and broadcasts the event with the provided data,
       *          or undefined if the component or attribute is not found.
       */
      pub(name: any): (data: any) => void;
  }
  export default Component;

}
declare module 'kwikjs/components-base' {
  import EventBus from "kwikjs/services/event-bus";
  import Signal from "kwikjs/services/signal";
  import { ComponentOptionType } from "kwikjs/types/index";
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
      constructor(callback: any, options?: any);
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
      _initLifecycle(): void;
      /**
       * Registers a signal to this.signals.
       * When the component is rendered this.signals will be looped
       * to update the value, the value commonly came from the component props/attributes
       *
       * @param signal - The signal object to register.
       * @param callback - Optional. The callback function to be executed when the signal is triggered.
       */
      _registerSignal(signal: any, callback?: any): void;
      /**
       * Sets the lifecycle value for the component.
       *
       * @param value - The new lifecycle value to be set.
       */
      _setLifecycle(value: any): void;
  }
  export default ComponentBase;

}
declare module 'kwikjs/consts/component-lifecycle' {
  export const BEFORE_RENDERED = "before_rendered";
  export const RENDERED = "rendered";
  export const DESTROY = "destroy";
  export const CHANGE = "change";
  export const ADOPTED = "adopted";
  export const COMPONENT_LIFECYCLE: {
      BEFORE_RENDERED: string;
      RENDERED: string;
      DESTROY: string;
      CHANGE: string;
      ADOPTED: string;
  };

}
declare module 'kwikjs/index' {
  import Component from "kwikjs/component";
  import Signal from "kwikjs/services/signal";
  import Blueprint from "kwikjs/blueprint";
  import render from "kwikjs/utils/append";
  import EventBus from "kwikjs/services/event-bus";
  export { render, Component, Blueprint, Signal, EventBus };

}
declare module 'kwikjs/services/event-bus' {
  export default class EventBus {
      subscriber: any;
      constructor();
      on(event: any, callback: any): void;
      broadcast(event: any, data: any): void;
      clean(event?: any): void;
      toString(): string;
  }

}
declare module 'kwikjs/services/signal' {
  import EventBus from "kwikjs/services/event-bus";
  export default class Signal {
      id: string;
      _value: any;
      subscribers: any[];
      pubsub: EventBus;
      constructor(initialValue: any);
      _notify(): void;
      get value(): any;
      set value(v: any);
      subscribe(subscriber: any): void;
      toString(): any;
      _checkEquality(a: any, b: any): boolean;
      get isSignal(): boolean;
  }

}
declare module 'kwikjs/utils/append' {
  import Blueprint from "kwikjs/blueprint";
  /**
   * Renders a given component inside a target HTML element.
   *
   * This function clears the inner HTML of the target element and appends a new
   * element created from the provided component blueprint.
   *
   * @param target - The HTML element where the component will be rendered.
   * @param component - The blueprint of the component to be rendered.
   */
  export default function render(target: HTMLElement, component: Blueprint): void;

}
declare module 'kwikjs/utils/async' {
  /**
   * Converts a callback-based function to a Promise-based one.
   *
   * @param callback - The function to be promisified. Must be a function.
   * @param args - The arguments to pass to the callback function.
   * @returns A Promise that resolves with the result of the callback function or rejects with an error.
   * @throws Will throw an error if the first argument is not a function.
   */
  export const promisify: (callback: any, ...args: any[]) => Promise<unknown>;

}
declare module 'kwikjs/utils/data-wrapper' {
  /**
   * A class that wraps data and provides utility methods to interact with it.
   */
  export default class DataWrapper {
      ctx: any;
      /**
       * Creates an instance of DataWrapper.
       * @param ctx - The context or data to be wrapped.
       */
      constructor(ctx: any);
      /**
       * Gets the wrapped data.
       * @returns The wrapped data.
       */
      get data(): any;
      /**
       * Checks if the wrapped data is empty.
       * @returns `true` if the data is empty, otherwise `false`.
       */
      get isEmpty(): boolean;
      /**
       * Iterates over the wrapped data and applies a callback function to each element.
       * @param callback - The function to be called for each element. It receives the value and key as arguments.
       * @returns A concatenated string of the results of the callback function.
       */
      each(callback: any): string;
  }

}
declare module 'kwikjs/utils/el' {
  /**
   * Retrieves all comment nodes from a given DOM node. Optionally filters comments by a target value.
   *
   * @param {Node} node - The DOM node to search for comment nodes.
   * @param {string} [target] - Optional. The target comment value to filter by.
   * @returns {Comment[]} An array of comment nodes. If a target is provided, only comments matching the target value are returned.
   */
  export const getComments: (node: any, target?: any) => any[];
  /**
   * Converts a string of HTML into a Document's body element.
   *
   * @param str - The HTML string to be converted.
   * @returns The body element of the parsed HTML document.
   */
  export const stringToHTML: (str: any) => HTMLElement;

}
declare module 'kwikjs/utils/loop' {
  /**
   * Iterates over elements of an array, object, or map and invokes a callback for each element.
   *
   * @param array - The collection to iterate over. Can be an array, object, or map.
   * @param callback - The function to invoke for each element. It receives two arguments: the value and the key/index.
   */
  export const loop: (array: any, callback: any) => void;
  /**
   * Asynchronously iterates over elements of an array, object, or map and invokes a callback for each element.
   *
   * @param array - The collection to iterate over. Can be an array, object, or map.
   * @param callback - The async function to invoke for each element. It receives two arguments: the value and the key/index.
   * @returns A promise that resolves when all elements have been processed.
   */
  export const loopAsync: (array: any, callback: any) => Promise<void>;

}
declare module 'kwikjs/utils/rand' {
  export const generateId: () => string;

}
declare module 'kwikjs' {
  import main = require('kwikjs/src/index');
  export = main;
}