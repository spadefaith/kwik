declare module "kwikjs/blueprint" {
  import { CallbackParameterType } from "kwikjs/components";
  export default class Blueprint {
    callback: any;
    current: any;
    extension: HTMLElement;
    customType: "open" | "closed" | null;
    constructor(
      callback: (params: CallbackParameterType) => void,
      options?: any
    );
    build(): any;
    toString(): any;
    get close(): any;
  }
}
declare module "kwikjs/components" {
  import DataWrapper from "kwikjs/utils/data-wrapper";
  import EventBus from "kwikjs/services/event-bus";
  import Signal from "kwikjs/services/signal";
  export type AttributesItemType = {
    signal: string;
    name: string;
  };
  export type SignalItemType = {
    [key: string]: {
      signal: Signal;
      callbacks?: ((a: any) => any)[];
    };
  };
  export type CallbackParameterType = {
    node: (signal: Signal) => string;
    render: (signal: Signal, template: any, opts?: any) => any;
    attr: (attr: string, signal: Signal) => any;
    events: (events: any) => any;
    props: (name: string, initialValue: any) => any;
    style: (obj: any) => any;
    ref: (callback?: (el: HTMLElement) => any) => any;
    signal: (value: any) => Signal;
    onConnected: (callback: () => any) => any;
  };
  const Component: {
    new (callback: (params: CallbackParameterType) => any, options?: any): {
      name: string;
      id: string;
      attributes: AttributesItemType[];
      template: any;
      callback: any;
      custom: any;
      componentCallback: any;
      componentDisconnectCallback: any;
      signals: SignalItemType;
      styles: any;
      events: any;
      lifecycle: EventBus;
      props: any;
      options: any;
      refs: any;
      extension: HTMLElement;
      customType: "open" | "closed" | null;
      _initLifecycle(): void;
      _createTemplate(): void;
      _styleCallback(obj: any): string;
      _propsCallback(name: any, initialValue: any): Signal;
      _connectedCallback(callback: any): void;
      _refCallback(callback?: any): {
        readonly current: any;
        toString(): string;
      };
      _eventsCallback(events: any): string;
      _attrCallback(attr: any, signal: any): string;
      _attrDataCallback(attr: any, signal: any): string;
      _nodeCallback(signal: Signal): string;
      _renderCallback(
        signal: any,
        template: (params: DataWrapper) => string,
        opts?: any
      ): string;
      _createCustom(): void;
      _registerSignal(signal: any, callback?: any): void;
    };
  };
  export default Component;
}
declare module "kwikjs/consts/component-lifecycle" {
  export const RENDERED = "rendered";
  export const DESTROY = "destroy";
  export const CHANGE = "change";
  export const ADOPTED = "adopted";
  export const COMPONENT_LIFECYCLE: {
    RENDERED: string;
    DESTROY: string;
    CHANGE: string;
    ADOPTED: string;
  };
}
declare module "kwikjs/index" {
  import Component from "kwikjs/components";
  import Signal from "kwikjs/services/signal";
  import Blueprint from "kwikjs/blueprint";
  import render from "kwikjs/utils/append";
  import EventBus from "kwikjs/services/event-bus";
  export { render, Component, Blueprint, Signal, EventBus };
}
declare module "kwikjs/services/custom" {
  import EventBus from "kwikjs/services/event-bus";
  const Custom: (
    component: any,
    lifecycle: EventBus
  ) => CustomElementConstructor;
  export default Custom;
}
declare module "kwikjs/services/event-bus" {
  export default class EventBus {
    subscriber: any;
    constructor();
    on(event: any, callback: any): void;
    broadcast(event: any, data: any): void;
    clean(event: any): void;
  }
}
declare module "kwikjs/services/jsx" {
  export default class JSXProcess {
    renderFunction: null | (() => any);
    component: any;
    jsx: any;
    events: any[];
    signals: any[];
    constructor(component: any);
    toHtml(): {
      str: any;
      html: HTMLElement;
    };
  }
}
declare module "kwikjs/services/signal" {
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
declare module "kwikjs/utils/append" {
  export default function render(target: any, component: any): void;
}
declare module "kwikjs/utils/data-wrapper" {
  export default class DataWrapper {
    ctx: any;
    constructor(ctx: any);
    get data(): any;
    get isEmpty(): boolean;
    each(callback: any): string;
  }
}
declare module "kwikjs/utils/el" {
  export const getComments: (node: any, target?: any) => any[];
  export const stringToHTML: (str: any) => HTMLElement;
}
declare module "kwikjs/utils/eval" {}
declare module "kwikjs/utils/loop" {
  export const loop: (array: any, callback: any) => void;
}
declare module "kwikjs/utils/rand" {
  export const generateId: () => string;
}
declare module "kwikjs" {
  import main = require("kwikjs/index");
  export = main;
}
