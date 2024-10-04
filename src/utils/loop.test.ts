import { loop, loopAsync } from "./loop";

describe("loop", () => {
  it("should iterate over an array and invoke the callback for each element", () => {
    const array = [1, 2, 3];
    const callback = jest.fn();

    loop(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1, 0);
    expect(callback).toHaveBeenCalledWith(2, 1);
    expect(callback).toHaveBeenCalledWith(3, 2);
  });

  it("should iterate over an object and invoke the callback for each element", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const callback = jest.fn();

    loop(obj, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1, "a");
    expect(callback).toHaveBeenCalledWith(2, "b");
    expect(callback).toHaveBeenCalledWith(3, "c");
  });

  it("should iterate over a map and invoke the callback for each element", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const callback = jest.fn();

    loop(map, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1, "a");
    expect(callback).toHaveBeenCalledWith(2, "b");
    expect(callback).toHaveBeenCalledWith(3, "c");
  });

  it("should return immediately if the array is null or undefined", () => {
    const callback = jest.fn();

    loop(null, callback);
    loop(undefined, callback);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("loopAsync", () => {
  it("should iterate over an array and invoke the async callback for each element", async () => {
    const array = [1, 2, 3];
    const callback = jest.fn().mockResolvedValue(undefined);

    await loopAsync(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1, 0);
    expect(callback).toHaveBeenCalledWith(2, 1);
    expect(callback).toHaveBeenCalledWith(3, 2);
  });

  it("should iterate over an object and invoke the async callback for each element", async () => {
    const obj = { a: 1, b: 2, c: 3 };
    const callback = jest.fn().mockResolvedValue(undefined);

    await loopAsync(obj, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1, "a");
    expect(callback).toHaveBeenCalledWith(2, "b");
    expect(callback).toHaveBeenCalledWith(3, "c");
  });

  it("should iterate over a map and invoke the async callback for each element", async () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const callback = jest.fn().mockResolvedValue(undefined);

    await loopAsync(map, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1, "a");
    expect(callback).toHaveBeenCalledWith(2, "b");
    expect(callback).toHaveBeenCalledWith(3, "c");
  });

  it("should return immediately if the array is null or undefined", async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    await loopAsync(null, callback);
    await loopAsync(undefined, callback);

    expect(callback).not.toHaveBeenCalled();
  });
});
