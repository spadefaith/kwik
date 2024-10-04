import Blueprint from "../blueprint";

/**
 * Renders a given component inside a target HTML element.
 *
 * This function clears the inner HTML of the target element and appends a new
 * element created from the provided component blueprint.
 *
 * @param target - The HTML element where the component will be rendered.
 * @param component - The blueprint of the component to be rendered.
 */
export default function render(target: HTMLElement, component: Blueprint) {
  target.innerHTML = "";
  target.appendChild(document.createElement(`${component}`));
}
