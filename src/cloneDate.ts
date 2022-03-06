/**
 * Creates a clone of `date`.
 *
 * @private
 * @param {Date} targetDate The date to clone.
 * @returns {Object} Returns the cloned date.
 */
export function cloneDate(targetDate: Date): Date {
  return new Date(targetDate.getTime());
}
