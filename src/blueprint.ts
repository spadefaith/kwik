import Component from "./component";
import { ComponentOptionType } from "./types";

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
  constructor(
    callback: (params: typeof Component.prototype) => void,
    options = {} as ComponentOptionType
  ) {
    this.callback = callback;
    this.current = null;

    this.options = options || ({} as any);
  }

  /**
   * Builds a new component instance using the provided callback and options.
   *
   * @returns {string} The name of the newly created component.
   */
  build() {
    this.current = new Component(this.callback, this.options);
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
}
