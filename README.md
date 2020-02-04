# deep-copy-ts

A deep-copy (a.k.a. clone) utility function for TypeScript, based on [ts-deepcopy](https://github.com/ykdr2017/ts-deepcopy). Explore it in [CodeSandbox](https://codesandbox.io/s/laughing-pare-636xh).

## Installation

```console
npm i deep-copy-ts
```

## Usage

```ts
import { deepCopy } from 'deep-copy-ts';

const obj = {
  // Primitive value
  a: 1,
  b: "b",
  c: {
    a: [{ a: "caa1" }, { a: "caa2" }]
  },
  d: null,
  e: undefined,
  f: true,
  // Reference value
  g: [1, 2, 3],
  h: () => {
    return "h";
  },
  i: {
    a: 1,
    b: "i.b",
    c: "",
    d: null,
    e: undefined,
    f: true,
    g: [1, 2, 3],
    h: () => {
      return "i.h";
    },
    i: { a: 1 }
  },
  j: new Date()
};

const obj2 = deepCopy(obj);
console.log('obj2: ' + JSON.stringify(obj2, null, 2));
console.log('obj2.h: ' + obj2.h);
```

## Developing

```bash
npm i
npm start
```

## Publishing

```bash
npm run dry-run       # To check all files that will be send to npm
npm run patch-release # or minor-release/major-release
```
