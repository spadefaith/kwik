import Component, { CallbackParameterType } from "./components";

export default class Blueprint {
  callback: any;
  current: any;
  extension: HTMLElement;
  customType: "open" | "closed" | null;

  constructor(
    callback: (params: CallbackParameterType) => void,
    options = {} as any
  ) {
    this.callback = callback;
    this.current = null;

    this.extension = options.extension;
    this.customType = options.type;
  }
  build() {
    this.current = new Component(this.callback, {
      extension: this.extension,
      type: this.customType,
    });
    return this.current.name;
  }
  toString() {
    return this.build();
  }

  get close() {
    return this.current.name;
  }
}
