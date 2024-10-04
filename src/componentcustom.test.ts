import ComponentCustom from "./component-custom";
import { COMPONENT_LIFECYCLE } from "./consts/component-lifecycle";

describe("ComponentCustom", () => {
  let component;
  let mockCallback;
  let mockLifecycle;

  beforeEach(() => {
    mockCallback = jest.fn();
    mockLifecycle = {
      broadcast: jest.fn(),
    };
    component = new ComponentCustom(mockCallback, {
      name: "test-component",
      attributes: { attr1: "value1" },
      options: { extension: HTMLElement },
    });

    component._setLifecycle(mockLifecycle);
  });

  describe("createCustomElement", () => {
    it("should return true if the custom element already exists", () => {
      customElements.define("test-component", class extends HTMLElement {});
      expect(component.createCustomElement()).toBe(true);
    });

    it("should define a new custom element if it does not exist", () => {
      expect(component.createCustomElement()).toBe(true);
      expect(customElements.get("test-component")).toBeDefined();
    });
  });

  describe("_adoptedCallback", () => {
    it("should broadcast the ADOPTED lifecycle event", () => {
      const element = document.createElement("div");
      component._adoptedCallback(element);
      expect(mockLifecycle.broadcast).toHaveBeenCalledWith(
        COMPONENT_LIFECYCLE.ADOPTED,
        element
      );
    });
  });

  describe("_disconnectedCallback", () => {
    it("should broadcast the DESTROY lifecycle event", () => {
      const element = document.createElement("div");
      component._disconnectedCallback(element);
      expect(mockLifecycle.broadcast).toHaveBeenCalledWith(
        COMPONENT_LIFECYCLE.DESTROY,
        element
      );
    });
  });

  describe("_attributeChangedCallback", () => {
    it("should broadcast the CHANGE lifecycle event", () => {
      component._attributeChangedCallback("attr1", "oldValue", "newValue");
      expect(mockLifecycle.broadcast).toHaveBeenCalledWith(
        COMPONENT_LIFECYCLE.CHANGE,
        {
          name: "attr1",
          oldValue: "oldValue",
          newValue: "newValue",
        }
      );
    });
  });

  describe("_connectedCallback", () => {
    it("should handle the connected callback lifecycle event", async () => {
      const element = document.createElement("div");
      const container = document.createElement("div");
      jest.spyOn(component, "_templateToHtml").mockReturnValue(container);
      jest.spyOn(component, "_replaceSlot").mockResolvedValue(undefined);
      jest
        .spyOn(component, "_removeUnusedSlotsInTemplate")
        .mockResolvedValue(undefined);
      await component._connectedCallback(element, container);
      expect(component._templateToHtml).toHaveBeenCalled();
      expect(component._replaceSlot).toHaveBeenCalledWith(element, container);
      expect(component._removeUnusedSlotsInTemplate).toHaveBeenCalledWith(
        container
      );
      expect(mockLifecycle.broadcast).toHaveBeenCalledWith(
        COMPONENT_LIFECYCLE.RENDERED,
        element
      );
    });
  });

  describe("_removeUnusedSlotsInTemplate", () => {
    it("should remove all named slots from the template", async () => {
      const template = document.createElement("div");
      template.innerHTML =
        '<slot name="slot1"></slot><slot name="slot2"></slot>';
      await component._removeUnusedSlotsInTemplate(template);
      expect(template.querySelectorAll("slot[name]").length).toBe(0);
    });
  });

  describe("_replaceSlot", () => {
    it("should replace slots in the target element with corresponding slots from the source element", async () => {
      const src = document.createElement("div");
      src.innerHTML = '<div slot="slot1"></div><div slot="slot2"></div>';
      const target = document.createElement("div");
      target.innerHTML = '<slot name="slot1"></slot><slot name="slot2"></slot>';
      await component._replaceSlot(src, target);
      expect(target.querySelectorAll("slot[name]").length).toBe(0);
    });
  });

  describe("_templateToHtml", () => {
    it("should convert the template to an HTML string", () => {
      component.template = "<div>Test</div>";

      expect(component._templateToHtml().innerHTML).toBe("<div>Test</div>");
    });

    it("should execute the template function and convert its result to HTML", () => {
      component.template = () => "<div>Test</div>";
      expect(component._templateToHtml().innerHTML).toBe("<div>Test</div>");
    });
  });
});
