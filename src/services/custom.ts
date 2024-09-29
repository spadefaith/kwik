import JSXProcess from "./jsx";
import { stringToHTML } from "../utils/el";
import EventBus from "./event-bus";
import { loop } from "../utils/loop";
import { COMPONENT_LIFECYCLE } from "../consts/component-lifecycle";

const Custom = (component, lifecycle: EventBus) => {
  const id = component.id,
    name = component.name,
    attributes = component.attributes.map((item) => item.name),
    extension: HTMLElement = component.extension || HTMLElement,
    customType = component.customType,
    template = component.template;

  let vdom = new JSXProcess(component);
  let tempalateHtml = null;
  let initialInnerHtml: any = "";

  if (customElements.get(name)) {
    return customElements.get(name);
  }

  const classFactory: any = (ext) => {
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
        loop(tempalateHtml.childNodes, (child) =>
          this._container().appendChild(child)
        );

        lifecycle.broadcast(COMPONENT_LIFECYCLE.RENDERED, this);
      }
      disconnectedCallback() {
        lifecycle.broadcast(COMPONENT_LIFECYCLE.DESTROY, this);
      }

      adoptedCallback() {
        lifecycle.broadcast(COMPONENT_LIFECYCLE.ADOPTED, this);
      }
      attributeChangedCallback(name, oldValue, newValue) {
        lifecycle.broadcast(COMPONENT_LIFECYCLE.CHANGE, {
          name,
          oldValue,
          newValue,
        });
      }
      _replaceSlot(src, target) {
        const slots = src.querySelectorAll("[slot]");
        loop(slots, (slot, i) => {
          const slotName = slot.getAttribute("slot");
          const targetSlot = target.querySelector(`slot[name=${slotName}]`);
          if (targetSlot) {
            const attributes = targetSlot.attributes;
            loop(attributes, (attr) => {
              if (attr.name == "name") return;
              slot.setAttribute(attr.name, attr.value);
            });

            slot.removeAttribute("slot");
            targetSlot.replaceWith(slot);
          } else {
            slot.remove();
          }
        });
        /*
          remove slots without substiture;
        */
        const targetSlots = target.querySelectorAll("slot[name]");
        loop(targetSlots, (slot, i) => slot.remove());

        /**
         * removing the slot; if replaceWith did not remove it
         */
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

export default Custom;
