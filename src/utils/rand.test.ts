import { generateId } from "./rand";
const global = {};
describe("generateId", () => {
  beforeEach(() => {
    // Reset the initialId and idx before each test
    (global as any).initialId = null;
    (global as any).idx = 0;
  });

  it("should generate an ID with the correct format", () => {
    const id = generateId();
    expect(id).toMatch(/^x[a-zA-Z0-9]{5}0x$/);
  });

  it("should increment the index with each call", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toEqual(id2);
    expect(id2).toMatch(/^x[a-zA-Z0-9]{5}\d+x$/);
  });

  it("should use the same initialId for subsequent calls", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1.substring(1, 6)).toEqual(id2.substring(1, 6));
  });
});
