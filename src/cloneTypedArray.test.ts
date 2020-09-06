import { cloneTypedArray } from "./cloneTypedArray";

describe("cloneTypedArray", () => {
  it("should copy a Float32Array", () => {
    const buffer = new ArrayBuffer(16);
    const float32Array = new Float32Array(buffer, 0);
    float32Array[0] = 42;

    const copy = cloneTypedArray(float32Array);

    expect(copy).not.toBe(float32Array);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object Float32Array]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(4);
    expect(copy.length).toEqual(4);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Float64Array", () => {
    const buffer = new ArrayBuffer(16);
    const float64Array = new Float64Array(buffer, 0);
    float64Array[0] = 42;

    const copy = cloneTypedArray(float64Array);

    expect(copy).not.toBe(float64Array);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object Float64Array]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(8);
    expect(copy.length).toEqual(2);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Int8Array", () => {
    const buffer = new ArrayBuffer(16);
    const int8Array = new Int8Array(buffer, 0);
    int8Array[0] = 42;

    const copy = cloneTypedArray(int8Array);

    expect(copy).not.toBe(int8Array);
    expect(Object.prototype.toString.call(copy)).toEqual("[object Int8Array]");
    expect(copy.BYTES_PER_ELEMENT).toEqual(1);
    expect(copy.length).toEqual(16);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Int16Array", () => {
    const buffer = new ArrayBuffer(16);
    const int16Array = new Int16Array(buffer, 0);
    int16Array[0] = 42;

    const copy = cloneTypedArray(int16Array);

    expect(copy).not.toBe(int16Array);
    expect(Object.prototype.toString.call(copy)).toEqual("[object Int16Array]");
    expect(copy.BYTES_PER_ELEMENT).toEqual(2);
    expect(copy.length).toEqual(8);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Int32Array", () => {
    const buffer = new ArrayBuffer(16);
    const int32Array = new Int32Array(buffer, 0);
    int32Array[0] = 42;

    const copy = cloneTypedArray(int32Array);

    expect(copy).not.toBe(int32Array);
    expect(Object.prototype.toString.call(copy)).toEqual("[object Int32Array]");
    expect(copy.BYTES_PER_ELEMENT).toEqual(4);
    expect(copy.length).toEqual(4);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Uint8Array", () => {
    const buffer = new ArrayBuffer(16);
    const uint8Array = new Uint8Array(buffer, 0);
    uint8Array[0] = 42;

    const copy = cloneTypedArray(uint8Array);

    expect(copy).not.toBe(uint8Array);
    expect(Object.prototype.toString.call(copy)).toEqual("[object Uint8Array]");
    expect(copy.BYTES_PER_ELEMENT).toEqual(1);
    expect(copy.length).toEqual(16);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Uint16Array", () => {
    const buffer = new ArrayBuffer(16);
    const uint16Array = new Uint16Array(buffer, 0);
    uint16Array[0] = 42;

    const copy = cloneTypedArray(uint16Array);

    expect(copy).not.toBe(uint16Array);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object Uint16Array]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(2);
    expect(copy.length).toEqual(8);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Uint32Array", () => {
    const buffer = new ArrayBuffer(16);
    const uint32Array = new Uint32Array(buffer, 0);
    uint32Array[0] = 42;

    const copy = cloneTypedArray(uint32Array);

    expect(copy).not.toBe(uint32Array);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object Uint32Array]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(4);
    expect(copy.length).toEqual(4);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a Uint8ClampedArray", () => {
    const buffer = new ArrayBuffer(16);
    const uint8ClampedArray = new Uint8ClampedArray(buffer, 0);
    uint8ClampedArray[0] = 42;

    const copy = cloneTypedArray(uint8ClampedArray);

    expect(copy).not.toBe(uint8ClampedArray);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object Uint8ClampedArray]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(1);
    expect(copy.length).toEqual(16);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(42);
  });

  it("should copy a BigInt64Array", () => {
    const buffer = new ArrayBuffer(16);
    const bigInt64Array = new BigInt64Array(buffer, 0);
    bigInt64Array[0] = BigInt(42);

    const copy = cloneTypedArray(bigInt64Array);

    expect(copy).not.toBe(bigInt64Array);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object BigInt64Array]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(8);
    expect(copy.length).toEqual(2);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(BigInt(42));
  });

  it("should copy a BigUint64Array", () => {
    const buffer = new ArrayBuffer(16);
    const bigUint64Array = new BigUint64Array(buffer, 0);
    bigUint64Array[0] = BigInt(42);

    const copy = cloneTypedArray(bigUint64Array);

    expect(copy).not.toBe(bigUint64Array);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object BigUint64Array]"
    );
    expect(copy.BYTES_PER_ELEMENT).toEqual(8);
    expect(copy.length).toEqual(2);
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy[0]).toEqual(BigInt(42));
  });
});
