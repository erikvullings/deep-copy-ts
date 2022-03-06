// Erik: Qs: Copy vs. Clone... we should choose one term or the other - do you think?
// Of course, this could cause back compatibility issues - so perhaps don't worry about it?
// Mark -> Erik - you decide :).
// To rename it from copy to clone is a breaking change, but I do not believe it is worth pain for the users
// of this function. So let's not change it.

// module that provides facilities to deepCopy complex TS datastructures, including those with cyclic data, shared data and custom clasess
// [Erik: add some description of the ArrayBuffer etc. - I've not these so am unsure exactly what to put ... Mark-> Erik - over to you!.

// *** See Public section (commented) below for the Exported Interface (that client code uses) ***
// IMPORTANT: if client code switches on caching - **do not use in multi-threaded environments** (e.g. with nodejs threading).
// the cache mechanism is currently single threaded only.

import { cloneArrayBuffer } from "./cloneArrayBuffer";
import { cloneDataView } from "./cloneDataView";
import { cloneDate } from "./cloneDate";
import { cloneMap } from "./cloneMap";
import { cloneRegExp } from "./cloneRegexp";
import { cloneTypedArray } from "./cloneTypedArray";

/**
 * Cache object: stores target refs to data structure, against cloned versions.
 * - Enables processing of shared data and clones.
 * Requires that the cache is turned on via `useCache(true)`.
 */
const cache = new Map<unknown, unknown>();
/** If true (default off - backwards compatible), uses the cache */
let usingCache = false;
/** tracks recursion depth. deepCopy is mutually recursive with deepCopyNoCache. */
let depth = 0;

const TypedArrayMap = {
  "[object Date]": cloneDate,
  "[object ArrayBuffer]": cloneArrayBuffer,
  "[object DataView]": cloneDataView,
  "[object Float32Array]": cloneTypedArray,
  "[object Float64Array]": cloneTypedArray,
  "[object Int8Array]": cloneTypedArray,
  "[object Int16Array]": cloneTypedArray,
  "[object Int32Array]": cloneTypedArray,
  "[object Uint8Array]": cloneTypedArray,
  "[object Uint8ClampedArray]": cloneTypedArray,
  "[object Uint16Array]": cloneTypedArray,
  "[object Uint32Array]": cloneTypedArray,
  "[object BigInt64Array]": cloneTypedArray,
  "[object BigUint64Array]": cloneTypedArray,
  "[object RegExp]": cloneRegExp,
  "[object Map]": cloneMap,
} as { [key: string]: <T>(target: T) => T };

const deepCopyNoCache = <T>(target: T): T => {
  if (!target) return target;

  const tag = Object.prototype.toString.call(target);
  if (TypedArrayMap[tag]) return TypedArrayMap[tag](target);

  if (typeof (target as unknown as IDeepCopy<T>).cloneSelf === "function") {
    const cp = (target as unknown as IDeepCopy<T>).cloneSelf() as T;
    usingCache && cache.set(target as unknown, cp);
    return cp;
  }

  if (target instanceof Array) {
    const cp = [] as unknown[];

    (target as unknown[]).forEach((v, i) => {
      cp[i] = v;
    });
    usingCache && cache.set(target, cp);

    cp.forEach((v, i) => {
      cp[i] = deepCopy<unknown>(v);
    });

    return cp as unknown as T;
  }

  if (typeof target === "object") {
    const cp = {
      ...(target as unknown as { [key: string | symbol]: unknown }),
    };

    usingCache && cache.set(target, cp);

    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<unknown>(cp[k]);
    });
    return cp as unknown as T;
  }

  return target;
};

// Public ****************

/** Implement this interface for custom classes to enable them to be cloned. */
export interface IDeepCopy<T> {
  cloneSelf(): T;
}

/**
 * To enable use of clone-self in inline objects.
 * See clone.test.ts for examples.
 */
export const CLONE_SELF = "cloneSelf"; // do not

/**
 * Call this function to enable caching - default caching is off for back compatibility.
 * NB: Only when enabled, cloning can manage:
 * - cyclic data structures;
 * - shared data within a data structure (refs to same data);
 * @param caching
 */
export const useCache = (caching = true) => {
  usingCache = caching;
};

/**
 * Deep copy function for TypeScript.
 * @param target Target value to be copied.
 * @see Original source: ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 */
export const deepCopy = <T>(target: T): T => {
  // TODO: depth is never set to 0 again, so the cache is never cleared. So why do we use depth?
  if (depth === 0) cache.clear();
  depth++;

  return usingCache && cache.has(target)
    ? (cache.get(target) as T)
    : deepCopyNoCache(target);
};
