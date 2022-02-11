// nb: if you switch on caching - do not use in multi-threaded environments.

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
    const cp = (target as any)[CLONE_ME]() as T;
    cache.set(target as any, cp)
    return cp;
  }

  if (target instanceof Array) 
  {
    const cp = [] as any[];

    /* 
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

    (target as any[]).forEach ( (v, i) => { cp[i] = v; } );
    cache.set(target, cp)
    
    cp.forEach ( (v, i) => { cp[i] = deepCopy<any>(v); } )

    return cp as any;
  }

  if (typeof target === "object") 
  {
    const cp = { ...(target as { [key: string|symbol]: any }) } as {
      [key: string|symbol]: any;
    };
    
    cache.set(target as any, cp)
    
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
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

// to enable caching
export function useCache() { usingCache = true; }
useCache(); 
// switch on or off by default?
// switching on would change results for custom classes & self-referential/shared data refs.
// probably switch off by default? ERIC?

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

  // depth--;
  // if (depth === 0) cache.clear();

  return v;
}
