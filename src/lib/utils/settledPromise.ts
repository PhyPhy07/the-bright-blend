export function getFulfilledValues<T>(results: PromiseSettledResult<T>[]): T[] {
  return results
    .filter((r): r is PromiseFulfilledResult<T> => r.status === "fulfilled")
    .map((r) => r.value);
}
//getFulfilledValues is a utility function that returns the fulfilled values of a promise.allSettled array.