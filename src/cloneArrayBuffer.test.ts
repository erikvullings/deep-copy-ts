import { cloneArrayBuffer } from "./cloneArrayBuffer";

describe("cloneArrayBuffer", () => {
  it("should copy an ArrayBuffer", () => {
    const arrayBuffer = new ArrayBuffer(16);

    const copy = cloneArrayBuffer(arrayBuffer);

    expect(copy).not.toBe(arrayBuffer);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object ArrayBuffer]"
    );
    expect(copy.byteLength).toEqual(16);
  });
});
