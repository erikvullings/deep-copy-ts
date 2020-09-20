/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} targetRegexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
export function cloneRegExp(targetRegexp: RegExp): RegExp {
  const result = new RegExp(targetRegexp.source, targetRegexp.flags);
  result.lastIndex = targetRegexp.lastIndex;
  return result;
}
