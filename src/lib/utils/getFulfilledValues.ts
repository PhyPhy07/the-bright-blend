export function getFulfilledValues<T>(results: PromiseSettledResult<T>[]): T[] {
  return results
    .filter((r): r is PromiseFulfilledResult<T> => r.status === "fulfilled")
    .map((r) => r.value);
}
//takes successful results from promise.allSettled 