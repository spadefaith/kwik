import Blueprint from "../blueprint";
import { COMPONENT_LIFECYCLE } from "../consts/component-lifecycle";

/**
 * Renders a given component inside a target HTML element.
 *
 * This function clears the inner HTML of the target element and appends a new
 * element created from the provided component blueprint.
 *
 * @param target - The HTML element where the component will be rendered.
 * @param component - The blueprint of the component to be rendered.
 */
export function render(target: HTMLElement, component: Blueprint, callback?) {
  target.innerHTML = "";
  target.appendChild(document.createElement(`${component}`));

  component.current?.lifecycle.on(COMPONENT_LIFECYCLE.RENDERED, () => {
    callback && callback();
  });
}


export function renderOnce(target: HTMLElement, component: Blueprint) {
  const blueprintId = component.blueprintId;
  if (target.querySelector(`[blueprint=${blueprintId}]`)) {
    console.log(component);
  } else {
    target.innerHTML = "";
    target.appendChild(document.createElement(`${component}`));
  }
} 