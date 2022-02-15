/*
Unlike classes, interfaces exist only at compile - time, they are not included into the resulting JavaScript, so you cannot do an instanceof check.

You could make IWalkingAnimal a subclass of Animal(and use instanceof), or you could check if the object in question has a walk method:

if (animal['walk']) { }
You can wrap this in a user defined type guard (so that the compiler can narrow the type when used in an if statement, just like with instanceof).

/**
* User Defined Type Guard!
*/
function canWalk(arg: Animal): arg is IWalkingAnimal {
  return (arg as IWalkingAnimal).walk !== undefined;
}


private moveAnimal(animal: Animal) {
  if (canWalk(animal)) {
    animal.walk();  // compiler knows it can walk now
  }
}

CONSIDER THE ABOVE WHEN AWAKE - MARK. 
*/ 


// ERIC: Qs: Copy vs. Clone... we should choose one term or the other - do you think? 
// Of course, this could cause back compatibility issues - so perhaps don't worry about it?
// Mark -> Eric - you decide :).

// module that provides facilities to deepCopy complex TS datastructures, including those with cyclic data, shared data and custom clasess 
// [ERIC: add some description of the ArrayBuffer etc. - I've not these so am unsure exactly what to put ... Mark-> Eric - over to you!.

// *** See Public section (commented) below for the Exported Interface (that client code uses) ***
// IMPORTANT: if client code switches on caching - **do not use in multi-threaded environments** (e.g. with nodejs threading).
// the cache mechanism is currently single threaded only.

import { cloneArrayBuffer } from "./cloneArrayBuffer";
import { cloneDataView } from "./cloneDataView";
import { cloneDate } from "./cloneDate";
import { cloneMap } from "./cloneMap";
import { cloneRegExp } from "./cloneRegexp";
import { cloneTypedArray } from "./cloneTypedArray";

// cache - store target refs to data structure, against cloned versions - enables processing of shared data and clones.
const cache = new Map<unknown, unknown>();
// default off - backwards compatible.
let usingCache = false;

const TypedArrayMap: Record<string, Function> = {
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
};

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Original source: ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */

export function deepCopyNoCache<T>(target: T): T {
  if (!target) return target;

  const tag = Object.prototype.toString.call(target);
  if (TypedArrayMap[tag]) return TypedArrayMap[tag](target);

  if (
        ( typeof (target as unknown as IDeepCopy<T>).cloneSelf === 'function' )
  )
  {
    const cp = (target as any).cloneSelf() as T;
    cache.set(target as any, cp);
    return cp;
  }

  if (target instanceof Array) {
    const cp = [] as any[];
    /* TODO: Delete this comment, or relocate elsewhere...
      cache.set(target, cp) => causes problems.
      
      - without this line here, all compiles no errors.
      - with this line here - see errors below.

      <line nums edited manually - as I inserted this comment!>
      deepCopy.ts(60,5): error TS2349: This expression is not callable.
      Type 'Map<any, any>' has no call signatures.
      deepCopy.ts(74,34): error TS7006: Parameter 'v' implicitly has an 'any' type.
      deepCopy.ts(74,37): error TS7006: Parameter 'i' implicitly has an 'any' type.

      WHY? BASH HEAD AGAINST WALL MANY TIMES... HOURS ON THIS... JUST LUCK I SORTED IT - APPARENTLY.
    */

    (target as any[]).forEach((v, i) => {
      cp[i] = v;
    });
    cache.set(target, cp);

    cp.forEach((v, i) => {
      cp[i] = deepCopy<any>(v);
    });

    return cp as any;
  }

  if (typeof target === "object") {
    const cp = { ...(target as { [key: string | symbol]: any }) } as {
      [key: string | symbol]: any;
    };

    cache.set(target, cp);

    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }

  return target;
}

// Public ****************

// implement this interface for custom classes to enable them to be cloned.
export interface IDeepCopy<T> {
  cloneSelf(): T;
}
// to enable use of clone-self in inline objects. See clone.test.ts for examples.
export const CLONE_SELF = "cloneSelf";  // do not

// Call this function to enable caching - default caching is off for back compatibility.
// nb: when enables (and not unless enabled) cloning to be able to manage:
// - cyclic data structures; 
// - shared data within a data structure (refs to same data);
export function useCache(b = true) {
  usingCache = b;
}

// tracks recursion depth. deepCopy is mutually recursive with deepCopyNoCache.
let depth = 0;

export const deepCopy = <T>(target: T): T => {
  let val: T;

  if (depth === 0) cache.clear();
  depth++;

  if (usingCache && cache.has(target)) {
    val = cache.get(target);
  } else {
    val = deepCopyNoCache(target);
  }

  return val;
};
