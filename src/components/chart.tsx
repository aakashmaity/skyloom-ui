"use client";

import { useId, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "../lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "./table";
import { Button } from "./button";

export type ChartColor = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
export type ChartSeries = { key: string; label: string; color: ChartColor };
export type ChartDatum = { label: string } & Record<string, string | number | null>;
const numberFormat = (value: number) => new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);

export function ChartContainer({ children, className, label }: { children: ReactElement; className?: string; label: string }) {
  return <div aria-label={label} className={cn("sky-chart h-chart min-w-0 w-full text-caption", className)}><ResponsiveContainer width="100%" height="100%" minWidth={0}>{children}</ResponsiveContainer></div>;
}

type TooltipEntry = { name?: string | number; value?: string | number | (string | number)[]; color?: string };
export function ChartTooltipContent({ active, payload, label, formatValue = numberFormat }: { active?: boolean; payload?: readonly TooltipEntry[]; label?: ReactNode; formatValue?: (value: number) => string }) {
  if (!active || !payload?.length) return null;
  return <div className="sky-border grid gap-control rounded-control border-border bg-popover p-inline text-caption text-popover-foreground shadow-raised"><p className="font-medium">{label}</p>{payload.map((entry, index) => <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-panel"><span>{entry.name}</span><strong>{typeof entry.value === "number" ? formatValue(entry.value) : String(entry.value ?? "No data")}</strong></div>)}</div>;
}

function ChartFrame({ title, description, children, rows, columns }: { title: string; description?: string; children: ReactNode; rows: (string | number | null)[][]; columns: string[] }) {
  const id = useId();
  return <figure aria-labelledby={id} className="grid min-w-0 gap-stack"><figcaption><h3 id={id} className="text-body font-semibold">{title}</h3>{description && <p className="mt-control text-caption leading-body text-muted-foreground">{description}</p>}</figcaption>
    {rows.length ? children : <p role="status" className="p-panel text-label text-muted-foreground">No data for this selection.</p>}
    {!!rows.length && <details><summary className="sky-focus w-fit cursor-pointer rounded-control py-control text-caption text-muted-foreground">View data table</summary><Table><TableCaption>{title} values</TableCaption><TableHeader><TableRow>{columns.map((label, i) => <TableHead key={i}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, i) => <TableRow key={i}>{row.map((value, j) => <TableCell key={j}>{value ?? "No data"}</TableCell>)}</TableRow>)}</TableBody></Table></details>}
  </figure>;
}

export type CartesianChartProps = {
  title: string; description?: string; data: ChartDatum[]; series: ChartSeries[];
  kind?: "line" | "area" | "bar"; stacked?: boolean; unit: string; domain?: [number, number]; formatValue?: (value: number) => string;
};
export function CartesianChart({ title, description, data, series, kind = "line", stacked = false, unit, domain, formatValue = numberFormat }: CartesianChartProps) {
  const [hidden, setHidden] = useState<string[]>([]);
  const visible = series.filter(item => !hidden.includes(item.key));
  const axis = <><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} /><YAxis width="auto" domain={domain ?? [0, "auto"]} tickLine={false} axisLine={false} tickFormatter={formatValue} tick={{ fill: "var(--muted-foreground)" }} /><Tooltip content={<ChartTooltipContent formatValue={value => `${formatValue(value)} ${unit}`} />} /></>;
  const marks = visible.map(item => {
    const shared = { dataKey: item.key, name: item.label, stroke: `var(--${item.color})`, fill: `var(--${item.color})`, isAnimationActive: false };
    if (kind === "bar") return <Bar key={item.key} {...shared} stackId={stacked ? "total" : undefined} />;
    if (kind === "area") return <Area key={item.key} {...shared} type="linear" stackId={stacked ? "total" : undefined} className="sky-chart-area" connectNulls={false} />;
    return <Line key={item.key} {...shared} type="linear" dot={false} connectNulls={false} className="sky-chart-line" />;
  });
  const Chart = kind === "line" ? LineChart : kind === "area" ? AreaChart : BarChart;
  return <ChartFrame title={title} description={description} columns={["Period / category", ...series.map(item => `${item.label} (${unit})`)]} rows={data.map(row => [row.label, ...series.map(item => row[item.key] == null ? null : formatValue(Number(row[item.key])))])}>
    <p className="text-caption text-muted-foreground">{unit}</p><ChartContainer label={`${title}, ${unit}`}><Chart data={data} accessibilityLayer>{axis}{marks}</Chart></ChartContainer>
    <div className="flex flex-wrap gap-control" aria-label={`${title} series`}>{series.map(item => <Button key={item.key} size="sm" variant="ghost" aria-pressed={!hidden.includes(item.key)} disabled={visible.length === 1 && visible[0].key === item.key} onClick={() => setHidden(current => current.includes(item.key) ? current.filter(key => key !== item.key) : [...current, item.key])}><span className="size-control rounded-full" style={{ background: `var(--${item.color})` }} />{item.label}</Button>)}</div>
  </ChartFrame>;
}

export function DonutChart({ title, description, data, unit }: { title: string; description?: string; unit: string; data: { label: string; value: number; color: ChartColor }[] }) {
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  return <ChartFrame title={title} description={description} columns={["Category", unit]} rows={data.map(item => [item.label, item.value])}>
    {total > 0 ? <ChartContainer label={title}><PieChart accessibilityLayer><Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="80%" isAnimationActive={false} stroke="var(--background)">{data.map(item => <Cell key={item.label} fill={`var(--${item.color})`} />)}</Pie><Tooltip content={<ChartTooltipContent formatValue={value => `${numberFormat(value)} ${unit}`} />} /></PieChart></ChartContainer> : <p role="status" className="p-panel text-label">No nonzero values to display.</p>}
    <ul className="grid gap-control text-caption">{data.map(item => <li key={item.label} className="flex items-center gap-control"><span className="size-control rounded-full" style={{ background: `var(--${item.color})` }} />{item.label}<strong className="ms-auto">{numberFormat(item.value)} {unit}</strong></li>)}</ul>
  </ChartFrame>;
}

export function ScatterPlot({ title, description, data, xLabel, yLabel }: { title: string; description?: string; data: { label: string; x: number; y: number }[]; xLabel: string; yLabel: string }) {
  return <ChartFrame title={title} description={description} columns={["Configuration", xLabel, yLabel]} rows={data.map(item => [item.label, item.x, item.y])}>
    <p className="text-caption text-muted-foreground">X: {xLabel} · Y: {yLabel}</p><ChartContainer label={title}><ScatterChart accessibilityLayer><CartesianGrid stroke="var(--border)" /><XAxis type="number" dataKey="x" name={xLabel} domain={[0, "auto"]} tickLine={false} axisLine={false} /><YAxis type="number" dataKey="y" name={yLabel} width="auto" domain={[0, 100]} tickLine={false} axisLine={false} /><Tooltip cursor={false} content={<ChartTooltipContent />} /><Scatter name="Configuration" data={data} fill="var(--chart-2)" isAnimationActive={false} /></ScatterChart></ChartContainer>
  </ChartFrame>;
}

export function Heatmap({ title, description, columns, rows }: { title: string; description?: string; columns: string[]; rows: { label: string; values: (number | null)[] }[] }) {
  return <figure className="grid gap-stack"><figcaption><h3 className="font-semibold">{title}</h3><p className="mt-control text-caption text-muted-foreground">{description}</p></figcaption><Table><TableCaption>Score 0–100; higher is better. Missing values are not scored.</TableCaption><TableHeader><TableRow><TableHead>Configuration</TableHead>{columns.map(column => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length ? rows.map(row => <TableRow key={row.label}><TableHead scope="row">{row.label}</TableHead>{columns.map((column, index) => { const value = row.values[index] ?? null; return <TableCell key={column}><span className="sky-heat-cell block rounded-control p-control text-center font-medium" style={{ "--heat-weight": `${value == null ? 0 : Math.min(100, Math.max(0, value))}%` } as CSSProperties}>{value == null ? "No data" : `${value}%`}</span></TableCell>; })}</TableRow>) : <TableRow><TableCell colSpan={columns.length + 1}>No data for this selection.</TableCell></TableRow>}</TableBody></Table></figure>;
}
