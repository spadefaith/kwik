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

    this.events = [];
    this.signals = [];
  }

  toHtml() {
    const str = this.jsx;
    const html = stringToHTML(str);

    loop(this.component.events, (event) => {
      const { type, id, handler } = event;
      const target: HTMLElement = html.querySelector(
        `[data-event=${type}-${id}]`
      );
      if (target) {
        target.addEventListener(type, (e) => {
          handler(e);
        });
      }
    });

    return { str, html };
  }
}
