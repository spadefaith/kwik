import ComponentBase from "./components-base";
import { generateId } from "./utils/rand";
import EventBus from "./services/event-bus";
import Signal from "./services/signal";
import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";

jest.mock("./utils/rand");
jest.mock("./services/event-bus");
jest.mock("./services/signal");

describe("ComponentBase", () => {
  let component: ComponentBase;
  let callback: jest.Mock;

  beforeEach(() => {
    (generateId as jest.Mock).mockReturnValue("test-id");
    callback = jest.fn();
    component = new ComponentBase(callback);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct properties", () => {
    expect(component.callback).toBe(callback);
    expect(component.id).toBe("test-id");
    expect(component.name).toBe("x-test-id");
    expect(component.options).toEqual({ extension: HTMLElement });
    expect(component.attributes).toEqual({});
    expect(component.signals).toEqual({});
    expect(component.styles).toEqual({});
    expect(component.eventsStore).toEqual([]);
    expect(component.refs).toEqual({});
    expect(component.lifecycle).toBeInstanceOf(EventBus);
  });

  it("should register a signal with a callback", () => {
    const signal = new Signal("signal-id");
    const signalCallback = jest.fn();

    component._registerSignal(signal, signalCallback);

    expect(component.signals[signal.id]).toEqual({
      signal,
      callbacks: [signalCallback],
    });
  });

  it("should set the lifecycle value", () => {
    const newLifecycle = new EventBus();
    component._setLifecycle(newLifecycle);

    expect(component.lifecycle).toBe(newLifecycle);
  });

  describe("_initLifecycle", () => {
    let lifecycle: EventBus;

    beforeEach(() => {
      lifecycle = new EventBus();
      component._setLifecycle(lifecycle);
      component._initLifecycle();
    });

    it("should handle COMPONENT_LIFECYCLE.CHANGE event", () => {
      const signal = new Signal("signal-id");
      component.signals["attr"] = { signal, callbacks: [] };
      component.attributes["attr"] = { signal_id: "attr", name: "attr" };

      const changeHandler = lifecycle.on["mock"].calls.find(
        ([event]) => event === COMPONENT_LIFECYCLE.CHANGE
      )[1];

      changeHandler(
        { name: "attr", oldValue: "old", newValue: "new" },
        jest.fn()
      );

      expect(signal.value).toBe("new");
    });

    it("should handle COMPONENT_LIFECYCLE.RENDERED event", () => {
      const renderedHandler = lifecycle.on["mock"].calls.find(
        ([event]) => event === COMPONENT_LIFECYCLE.RENDERED
      )[1];

      const el = document.createElement("div");
      const next = jest.fn();

      renderedHandler(el, next);

      expect(next).toHaveBeenCalled();
    });

    it("should handle COMPONENT_LIFECYCLE.DESTROY event", () => {
      const destroyHandler = lifecycle.on["mock"].calls.find(
        ([event]) => event === COMPONENT_LIFECYCLE.DESTROY
      )[1];

      const el = document.createElement("div");
      const next = jest.fn();

      destroyHandler(el, next);

      expect(component.signals).toEqual({});
      expect(component.styles).toEqual({});
      expect(component.eventsStore).toEqual([]);
      expect(component.refs).toEqual({});
      expect(next).toHaveBeenCalled();
    });
  });
});
