# kwik

Component library that requires no build tools, It can be used directly
in the browser. It is leveraging the Web Components.

```

import { globalCount } from "./app.js";

const TestItem = new Kwik.Blueprint(({ node, events }) => {
  const t = Kwik.createSignal(0);

  const clickHandler = (e) => {
    t.value += 1;

    globalCount.value += 1;

    console.log(`item is clicked ${t}`);
  };

  return () => /*html */ `
    <button ${events({ click: clickHandler })} >
      Test
      ${node(t)}

    </button>
  `;
});

export default TestItem;

```
