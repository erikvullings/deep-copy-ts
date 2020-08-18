/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Orginal source: ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export function deepCopy<T>(target: T): T {
  if (target === null) {
    return target;
  } else if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  } else if (target instanceof ArrayBuffer) {
    const result = new ArrayBuffer(target.byteLength);
    new Uint8Array(result).set(new Uint8Array(target));
    return result as any;
  } else if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => {
      cp.push(v);
    });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  } else if (typeof target === "object" && target !== {}) {
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
