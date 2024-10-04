import render from "./append";
import Blueprint from "../blueprint";

describe("render", () => {
  let target: HTMLElement;
  let component: Blueprint;

  beforeEach(() => {
    // Create a mock target element
    target = document.createElement("div");
    document.body.appendChild(target);

    // Create a mock component blueprint
    component = "div" as unknown as Blueprint;
  });

  afterEach(() => {
    // Clean up the DOM
    document.body.removeChild(target);
  });

  it("should append a new element created from the component blueprint", () => {
    render(target, component);
    expect(target.children.length).toBe(1);
    expect(target.children[0].tagName.toLowerCase()).toBe("div");
  });

  it("should replace existing content with the new component", () => {
    target.innerHTML = "<p>Old Content</p>";
    render(target, component);
    expect(target.children.length).toBe(1);
    expect(target.children[0].tagName.toLowerCase()).toBe("div");
  });
});
