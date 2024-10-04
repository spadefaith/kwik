import DataWrapper from "./data-wrapper";
import { loop } from "./loop";

jest.mock("./loop");

describe("DataWrapper", () => {
  describe("data", () => {
    it("should return the wrapped data", () => {
      const ctx = { key: "value" };
      const wrapper = new DataWrapper(ctx);
      expect(wrapper.data).toBe(ctx);
    });
  });

  describe("isEmpty", () => {
    it("should return true if the wrapped data is null or undefined", () => {
      let wrapper = new DataWrapper(null);
      expect(wrapper.isEmpty).toBe(true);

      wrapper = new DataWrapper(undefined);
      expect(wrapper.isEmpty).toBe(true);
    });

    it("should return true if the wrapped data is an empty object", () => {
      const wrapper = new DataWrapper({});
      expect(wrapper.isEmpty).toBe(true);
    });

    it("should return true if the wrapped data is an empty array", () => {
      const wrapper = new DataWrapper([]);
      expect(wrapper.isEmpty).toBe(true);
    });

    it("should return true if the wrapped data is an empty Set", () => {
      const wrapper = new DataWrapper(new Set());
      expect(wrapper.isEmpty).toBe(true);
    });

    it("should return false if the wrapped data is a non-empty object", () => {
      const wrapper = new DataWrapper({ key: "value" });
      expect(wrapper.isEmpty).toBe(false);
    });

    it("should return false if the wrapped data is a non-empty array", () => {
      const wrapper = new DataWrapper([1, 2, 3]);
      expect(wrapper.isEmpty).toBe(false);
    });

    it("should return false if the wrapped data is a non-empty Set", () => {
      const wrapper = new DataWrapper(new Set([1, 2, 3]));
      expect(wrapper.isEmpty).toBe(false);
    });
  });

  describe("each", () => {
    it("should iterate over the wrapped data and apply the callback function", () => {
      const ctx = { a: 1, b: 2 };
      const wrapper = new DataWrapper(ctx);
      const callback = jest.fn((value, key) => `${key}:${value},`);

      (loop as jest.Mock).mockImplementation((data, cb) => {
        for (const key in data) {
          cb(data[key], key);
        }
      });

      const result = wrapper.each(callback);
      expect(result).toBe("a:1,b:2,");
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(1, "a");
      expect(callback).toHaveBeenCalledWith(2, "b");
    });
  });
});
