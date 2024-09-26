import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "browser",
    minify: true,
    outfile: "./dist/bundle.js",
    sourcemap: true,
    globalName: "Kwik", // Replace with the desired global variable name
    format: "iife", // Immediately Invoked Function Expression for browser compatibility
  })
  .catch(() => process.exit(1));
