import ComponentBase from "./components-base";
import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";
import { promisify } from "./utils/async";
import { stringToHTML } from "./utils/el";
import { loopAsync } from "./utils/loop";

class ComponentCustom extends ComponentBase {
  replaced: any;
  timeout: number;
  renderCount: number;
  constructor(callback, options = {} as any) {
    super(callback, options);
    this.callback = callback;
    this.replaced = {};
    this.renderCount = 0;
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

    const CustomElementDefinition: any = (ext) =>
      class extends ext {
        static observedAttributes = [
          ...[...new Set(Object.keys(self.attributes))],
          "key",
        ];
        constructor() {
          super();
          this._container();
        }

        async connectedCallback() {
          // await self._connectedCallback(this, this._container());

          /**
           * A component is connectedCallback is called in the following scenario
           * 1. render()
           * 2. regular render
           * 3. replacedWith - it refers to when the component is inserted via slot
           *
           * the timeout makes sure that only the last call of the connectedCallback
           * will call the component callback.
           *
           */

          clearTimeout(self.timeout);
          await new Promise(async (res: any, rej) => {
            self.timeout = setTimeout(() => {
              self
                ._connectedCallback(this, this._container())
                .then(res())
                .catch((err) => rej(err));
            }, 50);
          });
        }
        disconnectedCallback() {
          self._disconnectedCallback(this);
        }
        adoptedCallback() {
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
    this.lifecycle.broadcast(COMPONENT_LIFECYCLE.DESTROY, self);
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
      newValue,
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
    // console.trace();

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

    // console.log(123, this.callback, self.outerHTML);
    // console.log(123, this.callback, "_connectedCallback");
  }

  /**
   * Asynchronously removes all named slots from the given target element's template.
   *
   * @param target - The target element containing the template with slots to be removed.
   * @returns A promise that resolves when all named slots have been removed.
   */
  async _removeUnusedSlotsInTemplate(target) {
    //removing remaining slot of the template;
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
      //this refers to slot from the template that will be replaced by slot from the child of this component
      const targetSlot = target.querySelector(`slot[name=${slotName}]`);
      if (targetSlot) {
        //copying the attributes from the template slot to the slot from the child by looping through the attributes
        const attributes = targetSlot.attributes;
        await loopAsync(attributes, async (attr) => {
          if (attr.name == "name") return;
          slot.setAttribute(attr.name, attr.value);
        });
        await promisify(
          (targetSlot, slot) => {
            this.replaced[slotName] = slot;
            return targetSlot.replaceWith(slot.cloneNode(true));
          },
          targetSlot,
          slot
        );
        await promisify((slot) => slot.remove(), slot);
      } else {
        await promisify((slot) => slot.remove(), slot);
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
}

export default ComponentCustom;
