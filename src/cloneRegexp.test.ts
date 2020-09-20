import { cloneRegExp } from "./cloneRegexp";

describe("cloneRegexp", () => {
  it("should copy a Regexp", () => {
    const regexp = new RegExp("ab+c", "i");

    const copy = cloneRegExp(regexp);

    expect(copy).not.toBe(regexp);
    expect(Object.prototype.toString.call(copy)).toEqual("[object RegExp]");
    expect(copy.source).toEqual(regexp.source);
    expect(copy.flags).toEqual(regexp.flags);
    expect(copy.lastIndex).toEqual(regexp.lastIndex);
  });
});
