import JSXProcess from "./jsx";
import { stringToHTML } from "../utils/el";

const Custom = (
  component,
  {
    connectedCallback,
    disconnectedCallback,
    attributeChangedCallback,
    updateCallback,
  }
) => {
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

        connectedCallback(this);
      }
      disconnectedCallback() {
        // console.log("Custom element removed from page.");
        disconnectedCallback();
      }

      adoptedCallback() {
        // console.log("Custom element moved to new page.");
      }
      attributeChangedCallback(name, oldValue, newValue) {
        attributeChangedCallback(name, oldValue, newValue);
      }
    }
  );

  return customElements.get(name);
};

export default Custom;
