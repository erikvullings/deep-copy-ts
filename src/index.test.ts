import { deepCopy } from "./";

describe("deepCopy", () => {
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
      expect(copy.arrayBuffer.byteLength).toEqual(16);
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
      expect(copy.dataView.byteLength).toEqual(16);
      expect(copy.dataView.byteOffset).toEqual(0);
      expect(copy.dataView.getInt16(1)).toEqual(42);
    });
  });
});
