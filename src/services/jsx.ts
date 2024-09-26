import { stringToHTML } from "../utils/el";

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
    this.component.events.forEach((event) => {
      const { type, id, handler } = event;
      const target = html.querySelector(`[data-event=click-${id}]`);
      if (target) {
        target.addEventListener(type, (e) => {
          handler(e);
        });
      }
    });

    return { str, html };
  }
}
