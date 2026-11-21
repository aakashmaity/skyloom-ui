"use client";

import { useMemo, useState } from "react";
import { Icon, Badge, Button, Card, CardContent, CardHeader, CardTitle, CartesianChart, Container, DataTable, DonutChart, Heatmap, ScatterPlot, SelectField, useTheme, type DataTableColumn, type ChartColor } from "skyloom-ui";
import { aggregateRequests, evaluationRows, modelNames, percentile, requests, retrievalRows, type AIRequest } from "./ai-data";

const columns: DataTableColumn<AIRequest>[] = [
  { id: "id", header: "Request", cell: row => <code>{row.id}</code> },
  { id: "model", header: "Model", cell: row => row.model },
  { id: "status", header: "Status", cell: row => <Badge variant={row.status === "Success" ? "secondary" : "destructive"}>{row.status}</Badge> },
  { id: "tokens", header: "Tokens", cell: row => (row.input + row.output).toLocaleString("en") },
  { id: "duration", header: "Latency (s)", cell: row => (row.duration / 1000).toFixed(2) },
  { id: "cost", header: "Cost (USD)", cell: row => `$${row.cost.toFixed(4)}` },
];
const searchText = (row: AIRequest) => `${row.id} ${row.model} ${row.status}`;
const currency = (n: number) => `$${n.toFixed(3)}`;
export function PaginatedTableDemo() { return <DataTable data={requests} columns={columns} getRowId={row => row.id} caption="Synthetic AI requests" initialPageSize={5} searchText={searchText} searchLabel="Search requests" columnLayoutStorageKey="sky-ui-request-demo-columns" />; }

export function TokenUsageDemo({ rows = requests }: { rows?: AIRequest[] }) { return <CartesianChart title="Token usage" description="Synthetic daily totals. Cached input is a subset of input, shown separately without double-counting." kind="area" stacked unit="tokens" data={aggregateRequests(rows)} series={[{ key: "uncached", label: "Uncached input", color: "chart-1" }, { key: "cached", label: "Cached input", color: "chart-2" }, { key: "output", label: "Output", color: "chart-3" }]} />; }
export function LatencyDemo({ rows = requests }: { rows?: AIRequest[] }) { return <CartesianChart title="Response latency" description="Synthetic successful requests. Nearest-rank p50/p95 duration and median time to first token." unit="seconds" data={aggregateRequests(rows)} series={[{ key: "p50", label: "Duration p50", color: "chart-1" }, { key: "p95", label: "Duration p95", color: "chart-2" }, { key: "ttft", label: "TTFT p50", color: "chart-3" }]} />; }
export function CostDemo({ rows = requests }: { rows?: AIRequest[] }) { return <DonutChart title="Cost by model" description="Synthetic USD spend, using fictional rates—not provider prices." unit="USD" data={modelNames.map((label, index) => ({ label, color: `chart-${index + 1}` as ChartColor, value: Number(rows.filter(row => row.model === label).reduce((total, row) => total + row.cost, 0).toFixed(4)) }))} />; }
export function ErrorDemo({ rows = requests }: { rows?: AIRequest[] }) { return <CartesianChart title="Request error rate" description="Errors divided by all requests in each day. Synthetic data; 0–100% scale." unit="%" domain={[0, 100]} data={aggregateRequests(rows)} series={[{ key: "errors", label: "Error rate", color: "chart-5" }]} />; }
export function ThroughputDemo({ rows = requests }: { rows?: AIRequest[] }) { return <CartesianChart title="Generation throughput" description="Mean per-request output tokens / time after first token, successful synthetic requests only." unit="tokens/s" data={aggregateRequests(rows)} series={[{ key: "throughput", label: "Output speed", color: "chart-2" }]} />; }
export function HistogramDemo({ rows = requests }: { rows?: AIRequest[] }) {
  const data = [["0–2s", 0, 2000], ["2–4s", 2000, 4000], ["4–6s", 4000, 6000], ["6s+", 6000, Infinity]].map(([label, min, max]) => ({ label: String(label), count: rows.filter(row => row.duration >= Number(min) && row.duration < Number(max)).length }));
  return <CartesianChart kind="bar" title="Latency distribution" description="All synthetic attempts, including errors. Lower-inclusive, upper-exclusive duration buckets." unit="requests" data={data} series={[{ key: "count", label: "Attempts", color: "chart-2" }]} />;
}
export function EvaluationDemo() { return <Heatmap title="Evaluation scorecard" description="Synthetic fixed benchmark v1, 200 cases per configuration. Pass percentages; not model rankings." columns={["Correctness", "Grounding", "Instructions", "Safety"]} rows={evaluationRows} />; }
export function RetrievalDemo() { return <CartesianChart title="Retrieval quality" description="Synthetic fixed RAG benchmark v1, 200 cases. Mean normalized metrics shown as percentages." kind="bar" unit="%" domain={[0, 100]} data={retrievalRows} series={[{ key: "precision", label: "Context precision", color: "chart-1" }, { key: "recall", label: "Context recall", color: "chart-2" }, { key: "faithfulness", label: "Faithfulness", color: "chart-3" }]} />; }
export function TradeoffDemo() { return <ScatterPlot title="Cost vs. quality" description="Synthetic configurations on the same 200-case benchmark. Compare equal workloads; lower cost and higher score are preferable." xLabel="USD / 1,000 requests" yLabel="Evaluation pass %" data={[{ label: "Scout", x: 2.1, y: 82 }, { label: "Reasoner", x: 8.6, y: 94 }, { label: "Composer", x: 5.4, y: 87 }]} />; }
export function AgentDemo() { return <CartesianChart title="Agent completion stages" description="Synthetic cohort of 100 runs. Each later stage is a subset of the previous stage; counts are not independent tool calls." kind="bar" unit="runs" data={[{ label: "Started", count: 100 }, { label: "Planned", count: 94 }, { label: "Tool OK", count: 87 }, { label: "Complete", count: 79 }]} series={[{ key: "count", label: "Runs reaching stage", color: "chart-1" }]} />; }

export function AIAnalytics() {
  const [period, setPeriod] = useState("14");
  const [model, setModel] = useState("all");
  const { resolvedTheme, updateSettings } = useTheme();
  const dark = resolvedTheme === "dark";
  const rows = useMemo(() => requests.filter(row => Number(row.date.slice(-2)) > 14 - Number(period) && (model === "all" || row.model === model)), [period, model]);
  const failures = rows.filter(row => row.status === "Error").length;
  const p95 = percentile(rows.filter(row => row.status === "Success").map(row => row.duration / 1000), .95);
  return <Container className="py-page-wide"><div className="mb-panel flex flex-wrap items-center justify-between gap-stack"><Button variant="outline" asChild><a href="/"><Icon name="arrow-left" className="rtl:rotate-180" />Component library</a></Button><Button variant="outline" onClick={() => updateSettings({ theme: dark ? "light" : "dark" })}>{dark ? "Light theme" : "Dark theme"}</Button></div>
    <Badge variant="secondary">Synthetic demo · No live telemetry</Badge><h1 className="ds-heading mt-panel font-semibold">AI, in perspective.</h1><p className="mt-stack max-w-dialog text-body leading-body text-muted-foreground">See how your AI behaves, what it costs, and where to improve. Reusable charts and a paginated request log, all powered by Sky UI.</p>
    <div className="my-panel flex flex-col gap-stack tablet:flex-row"><SelectField id="ai-period" label="Operational window" value={period} onValueChange={setPeriod} options={[{ value: "14", label: "Nov 1–14, 2026" }, { value: "7", label: "Nov 8–14, 2026" }]} /><SelectField id="ai-model" label="Model" value={model} onValueChange={setModel} options={[{ value: "all", label: "All models" }, ...modelNames.map(value => ({ value, label: value }))]} /></div>
    <div className="grid gap-stack tablet:grid-cols-2 laptop:grid-cols-4">{[["Requests", String(rows.length)], ["Synthetic spend", currency(rows.reduce((sum, row) => sum + row.cost, 0))], ["Error rate", `${(failures / (rows.length || 1) * 100).toFixed(1)}%`], ["Duration p95", p95 == null ? "No data" : `${p95.toFixed(2)}s`]].map(([label, value]) => <Card key={label}><CardHeader><CardTitle className="text-label text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-title font-semibold">{value}</CardContent></Card>)}</div>
    <h2 className="mb-stack mt-page-wide text-title font-semibold">Usage & operations</h2><p className="mb-panel text-label text-muted-foreground">The selected window and model apply to these charts and the request log.</p>
    <div className="grid items-start gap-panel laptop:grid-cols-2">{[TokenUsageDemo, LatencyDemo, CostDemo, ErrorDemo, ThroughputDemo, HistogramDemo].map((Demo, index) => <Card key={index} className="p-panel"><Demo rows={rows} /></Card>)}</div>
    <h2 className="mb-stack mt-page-wide text-title font-semibold">Evaluation & agent benchmarks</h2><p className="mb-panel text-label text-muted-foreground">Separate fixed synthetic cohorts. Operational filters above do not change these benchmark examples.</p>
    <div className="grid items-start gap-panel laptop:grid-cols-2">{[EvaluationDemo, RetrievalDemo, TradeoffDemo, AgentDemo].map((Demo, index) => <Card key={index} className="min-w-0 p-panel"><Demo /></Card>)}</div>
    <Card className="mt-page-wide p-panel"><h2 className="mb-panel text-title font-semibold">Request log</h2><DataTable data={rows} columns={columns} getRowId={row => row.id} caption="Synthetic AI request log" searchText={searchText} searchLabel="Search requests" /></Card>
    <p className="mt-panel text-caption leading-body text-muted-foreground">Metric definitions follow the research notes in docs/ai-analytics.md. These examples demonstrate UI patterns, not real model performance or pricing.</p>
  </Container>;
}
