import { cloneArrayBuffer } from "./cloneArrayBuffer";

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @returns {Object} Returns the cloned data view.
 */
export function cloneDataView(dataView: DataView): DataView {
  const buffer = cloneArrayBuffer(dataView.buffer);
  return new DataView(buffer, dataView.byteOffset, dataView.byteLength);
}
