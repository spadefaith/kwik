import EventBus from "./event-bus";

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  test("should register an event listener", () => {
    const callback = jest.fn();
    eventBus.on("testEvent", callback);

    expect(eventBus.subscriber["testEvent"]).toContain(callback);
  });

  test("should broadcast an event to all listeners", () => {
    const callback1 = jest.fn((data, next) => next());
    const callback2 = jest.fn((data, next) => next());
    eventBus.on("testEvent", callback1);
    eventBus.on("testEvent", callback2);

    eventBus.broadcast("testEvent", "testData");

    expect(callback1).toHaveBeenCalledWith("testData", expect.any(Function));
    expect(callback2).toHaveBeenCalledWith("testData", expect.any(Function));
  });

  test("should clean a specific event", () => {
    const callback = jest.fn();
    eventBus.on("testEvent", callback);

    eventBus.clean("testEvent");

    expect(eventBus.subscriber["testEvent"]).toEqual([]);
  });

  test("should clean all events", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    eventBus.on("testEvent1", callback1);
    eventBus.on("testEvent2", callback2);

    eventBus.clean();

    expect(eventBus.subscriber["testEvent1"]).toEqual([]);
    expect(eventBus.subscriber["testEvent2"]).toEqual([]);
  });
});
