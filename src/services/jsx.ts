import { stringToHTML } from "../utils/el";
import { loop } from "../utils/loop";

export default class JSXProcess {
  renderFunction: null | (() => any);
  component: any;
  jsx: any;
  events: any[];
  signals: any[];
  constructor(component) {
    this.component = component;
    const ctx = component.template;
    this.renderFunction = null;

    if (typeof ctx == "function") {
      this.renderFunction = ctx;
      this.jsx = ctx();
    } else {
      this.jsx = ctx;
    }
  }

  toHtml() {
    const str = this.jsx;

    const html = stringToHTML(str);

    return { str, html };
  }
}
