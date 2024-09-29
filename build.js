import * as esbuild from "esbuild";
import pkg from "npm-dts";
import packge from "./package.json" assert { type: "json" };

const { dependencies, devDependencies } = packge;

const { Generator } = pkg;

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: false,
  external: Object.keys(dependencies).concat(Object.keys(devDependencies)),
  // tsconfig: "./tsconfig.json",
};

new Generator({
  entry: "src/index.ts",
  output: "dist/index.d.ts",
}).generate();

esbuild
  .build({
    ...sharedConfig,
    platform: "browser",
    outfile: "./dist/index.iife.js",
    sourcemap: true,
    globalName: "Kwik",
    format: "iife",
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    ...sharedConfig,
    platform: "neutral",
    target: "esnext",
    outfile: "./dist/index.esm.js",
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

esbuild
  .build({
    ...sharedConfig,
    platform: "node",
    outfile: "./dist/index.cjs.js",
  })
  .catch(() => process.exit(1));
