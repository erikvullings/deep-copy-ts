[![NPM](https://nodei.co/npm/deep-copy-ts.png?mini=true)](https://npmjs.org/package/deep-copy-ts)
[![Build Status](https://app.travis-ci.com/erikvullings/deep-copy-ts.svg?branch=master)](https://app.travis-ci.com/erikvullings/deep-copy-ts)
# deep-copy-ts

## Credits
* Eric Vullins - inception and ongoing work
* Mark Collins-Cope - data-structure cycles/custom classes

A deep-copy (a.k.a. clone) utility function for TypeScript, based on [ts-deepcopy](https://github.com/ykdr2017/ts-deepcopy). Explore it in [CodeSandbox](https://codesandbox.io/s/laughing-pare-636xh).

## Installation

```console
npm i deep-copy-ts
```

## Usage

### Vanilla

```ts
import { deepCopy } from "deep-copy-ts";

const obj = {
  // Primitive value
  a: 1,
  b: "b",
  c: {
    a: [{ a: "caa1" }, { a: "caa2" }],
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
    i: { a: 1 },
  },
  j: new Date(),
  k: new DataView(new ArrayBuffer(16), 0),
  l: new RegExp("ab+c", "i"),
  m: new ArrayBuffer(16),
  n: new Float32Array(new ArrayBuffer(16), 0),
  o: new Float64Array(new ArrayBuffer(16), 0),
  p: new Int8Array(new ArrayBuffer(16), 0),
  q: new Int16Array(new ArrayBuffer(16), 0),
  r: new Int32Array(new ArrayBuffer(16), 0),
  s: new Uint8Array(new ArrayBuffer(16), 0),
  t: new Uint16Array(new ArrayBuffer(16), 0),
  u: new Uint32Array(new ArrayBuffer(16), 0),
  v: new Uint8ClampedArray(new ArrayBuffer(16), 0),
  // not supported in Safari yet
  w: new BigInt64Array(new ArrayBuffer(16), 0),
  x: new BigUint64Array(new ArrayBuffer(16), 0),
};

const obj2 = deepCopy(obj);
console.log("obj2: " + JSON.stringify(obj2, null, 2));
console.log("obj2.h: " + obj2.h);
```
NB(1): By default any cycles in data, e.g.
```
let a = [ b, c, d ]
let b = [ a ];
```
will result in infinite looping (but see below).

NB(2): Any shared data in the original copy, e.g.
```
let b = [ c, d ]
let a = [ b, b ] // two references to the same b
```
will result in SEPARATE copies of b (in a) being created in the clone.

### Dealing with Cycles and Shared Data
Calling the function 'cacheSETXXX' enable the deep-copy function to 
* handle cycles as per NB(1) above. The resultant clone will have the same cycle...
* maintain the shared structure of the data as per NB(2).
So (where a' is the seperate new clone of a but importantly is Not the same data), NB(1) will yield:
```
a' = [ b', c', d' ]
b' = [ a' ]
```
whereby the cycle: a->b->a is reproduced: a'->b'->a'
NB(2) yields:
```
b' = [ c', d' ]
a' = [ b', b' ]
```
whereby a' contains two copies of the same reference to b' (so changing a'[0] changes a'[1] as well).

### Cloning Custom TS Classes
The default behaviour of Typescript in terms of visibility of both methods and data in a custom class - is confusing, depends and whether 
arrow style functions are used (or function() style function) and sometimes results in the 'this' pointer in a clone pointing back to the 
original.

The only viable solution to this is to have a Custom CLONE_ME method in classes which you wish to clone (perhaps as part of a larger 
data structure, or the class itself may have properties that are complex data structures. e.g.
```
class X implements DeepCopyable
{
	private data as COMPLEX_TYPE;

	constructor(data) { this.data = data; }
	getImportantElement() { return this.data[esoteric expression to find something]; }#
	[ CLONE_ME ]() { return new X(deepCopy( this.data ) };
}
```
the deepClone function will detect the CLONE_ME method and call it. In the example shown the CLONE_ME method creates a new instance of the class X - with a *copy* of the data from the original (using the deepCopy function recursively).

With this approach the client code has to determine what 'deep copy' actually means in terms of their classes, what behaviour does client code actually want?



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
