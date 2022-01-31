// nb: if you switch on caching - do not use in multi-threaded envs.

import { cloneArrayBuffer } from "./cloneArrayBuffer";
import { cloneDataView } from "./cloneDataView";
import { cloneDate } from "./cloneDate";
import { cloneMap } from "./cloneMap";
import { cloneRegExp } from "./cloneRegexp";
import { cloneTypedArray } from "./cloneTypedArray";

/*
class Cache
{
  private store = new Map<any, any>() ;

  clear = ()                 =>  this.store.clear();
  set =   (k: any, v: any)   =>  this.store.set(k,v); 
  get =   (k: any)           =>  this.store.get(k);
  has =   (k: any)           =>  this.store.get(k) !== undefined;
}
*/

let cache = new Map<object, any>();

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


// maintain backwards compatility - by default cache is off.
let usingCache = false;

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
  
  // ERIK - IS DATE NOW HANDLED ABOVE ??? Ping me can you. DITTO REGEXP...
  // ALSO ERIK - ANY NEED TO CACHE THE ABOVE? PING ME!

  if ( typeof (target as any)[CLONE_ME] === 'function')
  {
    const copyOfTarget = (target as any)[CLONE_ME]() as T;
    cache.set(target as any, copyOfTarget)
    return copyOfTarget;
  }

  if (target instanceof Array) 
  {
    const copyOfTarget = target.map(v => v) // CHECK HERE!
    cache.set(target as any, copyOfTarget)
    (target as any[]).forEach((v: any) => {
      copyOfTarget.push(v);
    });

    return copyOfTarget.map((n: any) => deepCopy<any>(n)) as any;
  }

  if (typeof target === "object") 
  {
    const copyOfTarget = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    cache.set(target as any, copyOfTarget)
    Object.keys(copyOfTarget).forEach((k) => {
      copyOfTarget[k] = deepCopy<any>(copyOfTarget[k]);
    });
    return copyOfTarget as T;
  }
  
  return target;
}

// Public I/F Below.
export interface DeepCopyable<T>
{
  [CLONE_ME](): T;
}

// tracks recursion depth. deepCopy is mutually recursive with deepCopyNoCache.
let depth = 0;

export function useCache() { usingCache = true; }
export const CLONE_ME = '_cloneMe';
export const deepCopy = <T>(target: T): T =>
{
  let v: T;

  if (depth === 0) cache.clear();
  depth++;
  if ( usingCache && cache.has(target as any) ) 
  {    
	v = cache.get(target as any);
  }  
  else
  {
    v = deepCopyNoCache(target);
  }

  depth--;
  if (depth === 0) cache.clear();

  return v;
}
