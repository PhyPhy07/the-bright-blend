import { getFulfilledValues } from "../getFulfilledValues"


describe("getFulfilledValues", () => {
  it("should return only fulfilled values when there are mixed fulfilled/rejected results", () => {
    const settledResults: PromiseSettledResult<number>[] = [
      { status: "fulfilled", value: 1 },
      { status: "rejected", reason: new Error("Error") },
      { status: "fulfilled", value: 2 },
    ];
    expect(getFulfilledValues(settledResults)).toEqual([1, 2]);
  });

  it("should return an empty array when all promises are rejected", () => {
    const settledResults: PromiseSettledResult<number>[] = [
      { status: "rejected", reason: new Error("Error") },
      { status: "rejected", reason: new Error("Error") },
    ];
    expect(getFulfilledValues(settledResults)).toEqual([]);
  });

  it("should return all values when all promises are fulfilled", () => {
    const settledResults: PromiseSettledResult<number>[] = [
      { status: "fulfilled", value: 1 },
      { status: "fulfilled", value: 2 },
      { status: "fulfilled", value: 3 },
    ];
    expect(getFulfilledValues(settledResults)).toEqual([1, 2, 3]);
  });

  it("should return a single value when only one promise is fulfilled", () => {
    const settledResults: PromiseSettledResult<number>[] = [
      { status: "fulfilled", value: 42 },
    ];
    expect(getFulfilledValues(settledResults)).toEqual([42]);
  });
});