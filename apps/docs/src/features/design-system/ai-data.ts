export const modelNames = ["Scout", "Reasoner", "Composer"] as const;
export type AIRequest = { id: string; date: string; model: string; input: number; cached: number; output: number; duration: number; ttft: number; cost: number; status: "Success" | "Error" };

/** Deterministic synthetic data. Model names and billing rates are fictional. */
export const requests: AIRequest[] = Array.from({ length: 84 }, (_, i) => {
  const day = Math.floor(i / 6) + 1;
  const model = modelNames[i % modelNames.length];
  const input = 800 + (i * 137) % 2400;
  const cached = i % 3 === 0 ? Math.floor(input * .4) : 0;
  const output = 120 + (i * 71) % 650;
  const duration = 600 + (i * 193) % 6200;
  return { id: `req-${String(i + 1).padStart(3, "0")}`, date: `2026-11-${String(day).padStart(2, "0")}`, model, input, cached, output, duration, ttft: Math.min(duration - 100, 180 + (i * 47) % 900), cost: ((input - cached) * 2 + cached * .5 + output * 6) / 1e6, status: i % 13 === 0 ? "Error" : "Success" };
});

/** Nearest-rank percentile; aggregate underlying observations, never daily percentiles. */
export function percentile(values: number[], quantile: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(Math.min(1, Math.max(0, quantile)) * sorted.length) - 1)];
}

export function aggregateRequests(rows: AIRequest[]) {
  const dates = [...new Set(rows.map(row => row.date))].sort();
  return dates.map(date => {
    const group = rows.filter(row => row.date === date);
    const successes = group.filter(row => row.status === "Success");
    const sum = (key: "input" | "cached" | "output" | "cost") => group.reduce((total, row) => total + row[key], 0);
    return { label: date.slice(5), uncached: sum("input") - sum("cached"), cached: sum("cached"), output: sum("output"), cost: sum("cost"), p50: percentile(successes.map(row => row.duration / 1000), .5), p95: percentile(successes.map(row => row.duration / 1000), .95), ttft: percentile(successes.map(row => row.ttft / 1000), .5), errors: group.filter(row => row.status === "Error").length / group.length * 100, throughput: successes.length ? successes.reduce((total, row) => total + row.output / ((row.duration - row.ttft) / 1000), 0) / successes.length : null };
  });
}

export const evaluationRows = [
  { label: "Scout", values: [82, 78, 85, 92] },
  { label: "Reasoner", values: [94, 91, 90, 95] },
  { label: "Composer", values: [87, 89, 93, 88] },
];
export const retrievalRows = [
  { label: "Baseline", precision: 71, recall: 68, faithfulness: 76 },
  { label: "Reranker", precision: 86, recall: 82, faithfulness: 88 },
  { label: "Hybrid", precision: 91, recall: 87, faithfulness: 92 },
];
