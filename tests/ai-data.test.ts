// @vitest-environment node
import { expect, it } from "vitest";
import { aggregateRequests, percentile, requests } from "../apps/docs/src/features/design-system/ai-data";

it("computes percentiles from observations and preserves missing values", () => {
  expect(percentile([], .95)).toBeNull();
  expect(percentile([4, 1, 2, 3], .5)).toBe(2);
  expect(percentile([4, 1, 2, 3], .95)).toBe(4);
});
it("does not double-count cached input and uses all attempts for error rate", () => {
  const result = aggregateRequests(requests);
  expect(result.reduce((sum, day) => sum + day.uncached + day.cached + day.output, 0)).toBe(requests.reduce((sum, row) => sum + row.input + row.output, 0));
  expect(result[0].errors).toBeCloseTo(100 / 6);
  const allFailed = aggregateRequests([{ ...requests[0], status: "Error" }]);
  expect(allFailed[0].p95).toBeNull();
  expect(allFailed[0].throughput).toBeNull();
  expect(allFailed[0].errors).toBe(100);
});
