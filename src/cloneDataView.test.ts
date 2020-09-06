import { cloneDataView } from "./cloneDataView";

describe("cloneDataView", () => {
  it("should copy a DataView", () => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0);

    view.setInt16(1, 42);

    const copy = cloneDataView(view);

    expect(copy).not.toBe(view);
    expect(Object.prototype.toString.call(copy)).toEqual("[object DataView]");
    expect(copy.byteLength).toEqual(16);
    expect(copy.byteOffset).toEqual(0);
    expect(copy.getInt16(1)).toEqual(42);
  });
});
