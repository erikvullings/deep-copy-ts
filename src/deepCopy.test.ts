import { deepCopy } from ".";

describe("deepCopy", () => {
  describe("string copies", () => {
    it("should copy strings", () => {
      const original = "Erik";
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
    });
  });

  describe("number copies", () => {
    it("should copy numbers", () => {
      const original = 42;
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
    });
  });

  describe("when an object has an ArrayBuffer", () => {
    it("should copy an ArrayBuffer", () => {
      const object = {
        arrayBuffer: new ArrayBuffer(16),
      };

      const copy = deepCopy(object);

      expect(copy.arrayBuffer).not.toBe(object.arrayBuffer);
      expect(Object.prototype.toString.call(copy.arrayBuffer)).toEqual(
        "[object ArrayBuffer]"
      );
    });
  });

  describe("when an object has a DataView", () => {
    it("should copy a DataView", () => {
      const buffer = new ArrayBuffer(16);
      const view = new DataView(buffer, 0);

      view.setInt16(1, 42);

      const object = {
        dataView: view,
      };

      const copy = deepCopy(object);

      expect(copy.dataView).not.toBe(object.dataView);
      expect(Object.prototype.toString.call(copy.dataView)).toEqual(
        "[object DataView]"
      );
    });
  });

  describe("when an object has a TypedArray", () => {
    it("should copy a TypedArray", () => {
      const buffer = new ArrayBuffer(16);
      const float32Array = new Float32Array(buffer, 0);
      float32Array[0] = 42;

      const object = {
        float32Array,
      };

      const copy = deepCopy(object);

      expect(copy.float32Array).not.toBe(object.float32Array);
      expect(Object.prototype.toString.call(copy.float32Array)).toEqual(
        "[object Float32Array]"
      );
    });
  });
});
