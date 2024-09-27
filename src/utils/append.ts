export default function render(target, component) {
  target.innerHTML = "";
  target.appendChild(document.createElement(`${component}`));
}
