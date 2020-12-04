import { cloneArrayBuffer } from "./cloneArrayBuffer";

export type TypedArrayType =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Uint8ClampedArray
  | BigInt64Array
  | BigUint64Array;

type TypedArrayConstructorType =
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Uint8ClampedArrayConstructor
  | BigInt64ArrayConstructor
  | BigUint64ArrayConstructor;

const TypedArrayMap: Record<string, TypedArrayConstructorType> = {
  "[object Float32Array]": Float32Array,
  "[object Float64Array]": Float64Array,
  "[object Int8Array]": Int8Array,
  "[object Int16Array]": Int16Array,
  "[object Int32Array]": Int32Array,
  "[object Uint8Array]": Uint8Array,
  "[object Uint16Array]": Uint16Array,
  "[object Uint32Array]": Uint32Array,
  "[object Uint8ClampedArray]": Uint8ClampedArray
};

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @returns {Object} Returns the cloned typed array.
 */
export function cloneTypedArray(typedArray: TypedArrayType): TypedArrayType {
  try{
    TypedArrayMap["[object BigInt64Array]"] = BigInt64Array;
    TypedArrayMap["[object BigUint64Array]"] = BigUint64Array;  
  }catch(e){}
  
  const buffer = cloneArrayBuffer(typedArray.buffer);
  return new TypedArrayMap[Object.prototype.toString.call(typedArray)](
    buffer,
    typedArray.byteOffset,
    typedArray.length
  );
}
