import Blueprint from "./blueprint";
import Component from "./component";
import { ComponentOptionType } from "./types";

jest.mock("./component");

describe("Blueprint", () => {
  let mockCallback: jest.Mock;
  let mockOptions: ComponentOptionType;
  let blueprint: Blueprint;

  beforeEach(() => {
    mockCallback = jest.fn();
    mockOptions = {};
    blueprint = new Blueprint(mockCallback, mockOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an instance of Blueprint", () => {
    expect(blueprint).toBeInstanceOf(Blueprint);
    expect(blueprint.callback).toBe(mockCallback);
    expect(blueprint.options).toBe(mockOptions);
    expect(blueprint.current).toBeNull();
  });

  it("should build a new component instance and return its name", () => {
    const mockComponentInstance = { name: "mockComponent" };
    (Component as jest.Mock).mockImplementation(() => mockComponentInstance);

    const componentName = blueprint.build();

    expect(Component).toHaveBeenCalledWith(mockCallback, mockOptions);
    expect(blueprint.current).toBe(mockComponentInstance);
    expect(componentName).toBe("mockComponent");
  });

  it("should convert the current object to a string representation", () => {
    const mockComponentInstance = { name: "mockComponent" };
    (Component as jest.Mock).mockImplementation(() => mockComponentInstance);

    const stringRepresentation = blueprint.toString();

    expect(stringRepresentation).toBe("mockComponent");
  });

  it("should return the name of the current object using the close getter", () => {
    const mockComponentInstance = { name: "mockComponent" };
    (Component as jest.Mock).mockImplementation(() => mockComponentInstance);

    blueprint.build();
    const closeName = blueprint.close;

    expect(closeName).toBe("mockComponent");
  });
});
