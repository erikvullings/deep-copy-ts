import { cloneMap } from "./cloneMap";

describe("cloneMap", () => {
  it("should copy a Map", () => {
    const original = new Map<number, boolean>([
      [1, true],
      [2, false],
    ]);

    const copy = cloneMap(original);

    expect(copy).not.toBe(original);
    expect(Object.prototype.toString.call(copy)).toEqual("[object Map]");
    original.forEach((value, key) => expect(value).toEqual(copy.get(key)));
  });
});
