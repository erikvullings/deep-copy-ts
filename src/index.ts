import { cloneArrayBuffer } from "./cloneArrayBuffer";
import { cloneDataView } from "./cloneDataView";
import { cloneTypedArray } from "./cloneTypedArray";

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Original source: ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export function deepCopy<T>(target: T): T {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof ArrayBuffer) {
    return cloneArrayBuffer(target) as any;
  }
  if (target instanceof DataView) {
    return cloneDataView(target) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => {
      cp.push(v);
    });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (
    target instanceof Float32Array ||
    target instanceof Float64Array ||
    target instanceof Int8Array ||
    target instanceof Int16Array ||
    target instanceof Int32Array ||
    target instanceof Uint8Array ||
    target instanceof Uint16Array ||
    target instanceof Uint32Array ||
    target instanceof Uint8ClampedArray ||
    target instanceof BigInt64Array ||
    target instanceof BigUint64Array
  ) {
    return cloneTypedArray(target) as any;
  }
  if (typeof target === "object" && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
}
