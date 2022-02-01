// nb: if you switch on caching - do not use in multi-threaded envs.

import { cloneArrayBuffer } from "./cloneArrayBuffer";
import { cloneDataView } from "./cloneDataView";
import { cloneDate } from "./cloneDate";
import { cloneMap } from "./cloneMap";
import { cloneRegExp } from "./cloneRegexp";
import { cloneTypedArray } from "./cloneTypedArray";

// cache - store target refs to data structure, against cloned versions.
let cache = new Map<any, any>();
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
export function deepCopyNoCache <T>(target: T): T 
{
  if ( !target ) return target;
  
  const tag = Object.prototype.toString.call(target);
  if (TypedArrayMap[tag]) return TypedArrayMap[tag](target);
  
  if ( typeof (target as any)[CLONE_ME] === 'function')
  {
    const copyOfTarget = (target as any)[CLONE_ME]() as T;
    cache.set(target as any, copyOfTarget)
    return copyOfTarget;
  }

  if (target instanceof Array) 
  {
    const copyOfTarget: any[] = [];
    // cache.set(target, copyOfTarget)

    (target as any[]).forEach((v: any) => {
      copyOfTarget.push(v);
    });
    cache.set(target, copyOfTarget)

    return copyOfTarget.map((n: any) => deepCopy<any>(n)) as any;
  }

  if (typeof target === "object") 
  {
    const copyOfTarget = { ...(target as { [key: string|symbol]: any }) } as {
      [key: string|symbol]: any;
    };
    cache.set(target as any, copyOfTarget)
    Object.keys(copyOfTarget).forEach((k) => {
      copyOfTarget[k] = deepCopy<any>(copyOfTarget[k]);
    });
    return copyOfTarget as T;
  }
  
  return target;
}

// Public ****************
export const CLONE_ME = 'cloneSelf_';

// implement this interface for custom cloneable class.
export interface DeepCopyable<T> 
{
  [CLONE_ME](): T;
}

// to enable caching.
export function useCache() { usingCache = true; }
useCache();

// tracks recursion depth. deepCopy is mutually recursive with deepCopyNoCache.
let depth = 0;

export const deepCopy = <T>(target: T): T =>
{
  let v: T;

  if (depth === 0) cache.clear();
  depth++;

  if ( usingCache && cache.has(target) ) 
  {    
	   v = cache.get(target);
  }  
  else
  {
    v = deepCopyNoCache(target);
  }

  depth--;
  if (depth === 0) cache.clear();

  return v;
}
