import { deepCopy } from "./deepCopy";

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Date} typedDate The map to clone.
 * @returns {Object} Returns the cloned map.
 */
export function cloneMap<K, V>(targetMap: Map<K, V>): Map<K, V> {
  const map = new Map<K, V>();
  targetMap.forEach((value, key) => map.set(deepCopy(key), deepCopy(value)));
  return map;
}
