import JSXProcess from "./jsx";
import { stringToHTML } from "../utils/el";
import Lifecycle from "./lifecycle";

const Custom = (component, lifecycle: Lifecycle) => {
  const id = component.id,
    name = component.name,
    attributes = component.attributes,
    template = component.template;

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
      }
      connectedCallback() {
        if (typeof template == "function") {
          const { str, html } = vdom.toHtml();

          tempalateHtml = html;
        }

        initialInnerHtml = this.innerHTML;

        this.innerHTML = "";
        const children = tempalateHtml.childNodes;
        [
          ...(stringToHTML(initialInnerHtml).childNodes as any),
          ...children,
        ].forEach((child) => {
          this.appendChild(child);
        });

        lifecycle.broadcast("rendered", this);
      }
      disconnectedCallback() {
        lifecycle.broadcast("destroy", this);
      }

      adoptedCallback() {
        lifecycle.broadcast("adopted", this);
      }
      attributeChangedCallback(name, oldValue, newValue) {
        lifecycle.broadcast("change", { name, oldValue, newValue });
      }
    }
  );

  return customElements.get(name);
};

export default Custom;
