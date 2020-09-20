import { cloneDate } from "./cloneDate";

describe("cloneDate", () => {
  it("should copy a Date", () => {
    const date = new Date();

    const copy = cloneDate(date);

    expect(copy).not.toBe(date);
    expect(Object.prototype.toString.call(copy)).toEqual("[object Date]");
    expect(copy.getTime()).toEqual(date.getTime());
  });
});
