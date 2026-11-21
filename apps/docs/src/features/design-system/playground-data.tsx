"use client";

import { CartesianChart, DonutChart, Heatmap, ScatterPlot, DataTable, Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell, type ChartSeries } from "skyloom-ui";
import { playground } from "./playground-model";

const rows = [{ id: "1", name: "Design review", status: "Complete" }, { id: "2", name: "Documentation", status: "In progress" }, { id: "3", name: "Release", status: "Pending" }];
const columns = [{ id: "name", header: "Name", cell: (row: typeof rows[number]) => row.name }, { id: "status", header: "Status", cell: (row: typeof rows[number]) => row.status }];
const chartData = [{ label: "Mon", input: 120, output: 60 }, { label: "Tue", input: 180, output: 90 }, { label: "Wed", input: 160, output: 110 }];
const series: ChartSeries[] = [{ key: "input", label: "Input", color: "chart-1" }, { key: "output", label: "Output", color: "chart-2" }];
const donutData = [{ label: "Design", value: 60, color: "chart-1" as const }, { label: "Engineering", value: 40, color: "chart-2" as const }];
const scatterData = [{ label: "Fast", x: 10, y: 60 }, { label: "Balanced", x: 20, y: 85 }, { label: "Thorough", x: 40, y: 95 }];
const heatRows = [{ label: "Model A", values: [80, 95] }, { label: "Model B", values: [90, null] }];

export const dataPlaygrounds = {
  "data-table": playground({ choices: { state: ["populated", "empty", "loading", "error"], management: ["enabled", "disabled"], pinning: ["none", "start", "end"] }, imports: "DataTable",
    setup: () => `const rows = ${JSON.stringify(rows)};\nconst columns = [{ id: "name", header: "Name", cell: (row: typeof rows[number]) => row.name }, { id: "status", header: "Status", cell: (row: typeof rows[number]) => row.status }];`,
    render: ({ state, management, pinning }) => <DataTable data={state === "empty" ? [] : rows} columns={columns} getRowId={row => row.id} caption="Preview tasks" loading={state === "loading"} error={state === "error" ? "Unable to load tasks." : undefined} columnManagement={management === "enabled"} defaultColumnLayout={{ order: ["name", "status"], visibility: { name: true, status: true }, pinning: { start: pinning === "start" ? ["name"] : [], end: pinning === "end" ? ["status"] : [] } }} />,
    code: ({ state, management, pinning }) => `<DataTable data={${state === "empty" ? "[]" : "rows"}} columns={columns} getRowId={row => row.id}\n  caption="Preview tasks" columnManagement={${management === "enabled"}}${state === "loading" ? " loading" : state === "error" ? ' error="Unable to load tasks."' : ""}\n  defaultColumnLayout={${JSON.stringify({ order: ["name", "status"], visibility: { name: true, status: true }, pinning: { start: pinning === "start" ? ["name"] : [], end: pinning === "end" ? ["status"] : [] } })}} />`,
  }),
  table: playground({ choices: { state: ["populated", "empty"] }, imports: "Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell", setup: () => `const rows = ${JSON.stringify(rows)};`,
    render: ({ state }) => <Table><TableCaption>Preview tasks</TableCaption><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{state === "empty" ? <TableRow><TableCell colSpan={2}>No tasks.</TableCell></TableRow> : rows.map(row => <TableRow key={row.id}><TableCell>{row.name}</TableCell><TableCell>{row.status}</TableCell></TableRow>)}</TableBody></Table>,
    code: ({ state }) => `<Table><TableCaption>Preview tasks</TableCaption><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>${state === "empty" ? '<TableRow><TableCell colSpan={2}>No tasks.</TableCell></TableRow>' : '{rows.map(row => <TableRow key={row.id}><TableCell>{row.name}</TableCell><TableCell>{row.status}</TableCell></TableRow>)}'}</TableBody></Table>`,
  }),
  cartesian: playground({ choices: { kind: ["line", "area", "bar"], stacking: ["separate", "stacked"], state: ["populated", "empty"] }, imports: "CartesianChart, type ChartSeries", setup: () => `const data = ${JSON.stringify(chartData)};\nconst series: ChartSeries[] = ${JSON.stringify(series)};`,
    render: ({ kind, stacking, state }) => <CartesianChart title="Preview usage" kind={kind} stacked={stacking === "stacked"} unit="tokens" data={state === "empty" ? [] : chartData} series={series} />,
    code: ({ kind, stacking, state }) => `<CartesianChart title="Preview usage" kind="${kind}" stacked={${stacking === "stacked"}} unit="tokens" data={${state === "empty" ? "[]" : "data"}} series={series} />`,
  }),
  donut: playground({ choices: { state: ["populated", "empty", "zero"] }, imports: "DonutChart, type ChartColor", setup: () => `const data: { label: string; value: number; color: ChartColor }[] = ${JSON.stringify(donutData)};`,
    render: ({ state }) => <DonutChart title="Preview allocation" unit="%" data={state === "empty" ? [] : state === "zero" ? donutData.map(item => ({ ...item, value: 0 })) : donutData} />,
    code: ({ state }) => `<DonutChart title="Preview allocation" unit="%" data={${state === "empty" ? "[]" : state === "zero" ? "data.map(item => ({ ...item, value: 0 }))" : "data"}} />`,
  }),
  scatter: playground({ choices: { state: ["populated", "empty"] }, imports: "ScatterPlot", setup: () => `const data = ${JSON.stringify(scatterData)};`, render: ({ state }) => <ScatterPlot title="Preview trade-offs" xLabel="Cost" yLabel="Quality" data={state === "empty" ? [] : scatterData} />, code: ({ state }) => `<ScatterPlot title="Preview trade-offs" xLabel="Cost" yLabel="Quality" data={${state === "empty" ? "[]" : "data"}} />` }),
  heatmap: playground({ choices: { state: ["populated", "empty"] }, imports: "Heatmap", setup: () => `const rows = ${JSON.stringify(heatRows)};`, render: ({ state }) => <Heatmap title="Preview scores" columns={["Quality", "Speed"]} rows={state === "empty" ? [] : heatRows} />, code: ({ state }) => `<Heatmap title="Preview scores" columns={["Quality", "Speed"]} rows={${state === "empty" ? "[]" : "rows"}} />` }),
};
