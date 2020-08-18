import { deepCopy } from "./";

describe("deepCopy", () => {
  it("should copy an ArrayBuffer", () => {
    const arrayBuffer = new ArrayBuffer(16);

    const copy = deepCopy(arrayBuffer);

    expect(copy).not.toBe(arrayBuffer);
    expect(Object.prototype.toString.call(copy)).toEqual(
      "[object ArrayBuffer]"
    );
    expect(copy.byteLength).toEqual(arrayBuffer.byteLength);
  });

  describe("as an attribute of an object", () => {
    it("should copy an ArrayBuffer", () => {
      const object = {
        array: new ArrayBuffer(16),
      };

      const copy = deepCopy(object);

      expect(copy.array).not.toBe(object.array);
      expect(Object.prototype.toString.call(copy.array)).toEqual(
        "[object ArrayBuffer]"
      );
      expect(copy.array.byteLength).toEqual(object.array.byteLength);
    });
  });
});
