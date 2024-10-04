import { promisify } from "./async";

describe("promisify", () => {
  it("should resolve with the result of a synchronous callback", async () => {
    const syncCallback = (a: number, b: number) => a + b;
    const result = await promisify(syncCallback, 1, 2);
    expect(result).toBe(3);
  });

  it("should resolve with the result of an asynchronous callback", async () => {
    const asyncCallback = async (a: number, b: number) => a + b;
    const result = await promisify(asyncCallback, 1, 2);
    expect(result).toBe(3);
  });

  it("should reject if the callback throws an error", async () => {
    const errorCallback = () => {
      throw new Error("Test error");
    };
    await expect(promisify(errorCallback)).rejects.toThrow("Test error");
  });

  it("should reject if the asynchronous callback rejects", async () => {
    const asyncErrorCallback = async () => {
      throw new Error("Async test error");
    };
    await expect(promisify(asyncErrorCallback)).rejects.toThrow(
      "Async test error"
    );
  });

  it("should throw an error if the first argument is not a function", async () => {
    await expect(promisify(null)).rejects.toThrow(
      "First argument must be a function"
    );
  });
});
