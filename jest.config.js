/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    html: '<html lang="zh-cmn-Hant"></html>',
    url: "https://jestjs.io/",
    userAgent: "Agent/007",
  },
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  globals: {
    crypto: {
      randomUUID: () => require("crypto").randomBytes(5),
    },
  },
};
