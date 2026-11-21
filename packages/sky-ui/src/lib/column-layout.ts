export type DataTableColumnLayout = {
  order: string[];
  visibility: Record<string, boolean>;
  pinning: { start: string[]; end: string[] };
};
export type ColumnLayoutDefinition = { id: string; header: string; enableHiding?: boolean; enablePinning?: boolean };
export type ColumnRegion = "start" | "center" | "end";
export type ColumnLayoutAction =
  | { type: "visibility"; id: string; visible: boolean }
  | { type: "pin"; id: string; region: ColumnRegion }
  | { type: "move"; id: string; target: string; visibleOnly?: boolean };

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; }

/** Reject broken storage payloads before reconciling valid layouts with current columns. */
export function readStoredColumnLayout(value: unknown): DataTableColumnLayout | undefined {
  const stored = record(value), layout = record(stored.layout), pins = record(layout.pinning);
  const stringArray = (input: unknown) => Array.isArray(input) && input.every(id => typeof id === "string");
  if (stored.version !== 1 || !stringArray(layout.order) || !stringArray(pins.start) || !stringArray(pins.end)
    || !layout.visibility || typeof layout.visibility !== "object" || Array.isArray(layout.visibility)
    || !Object.values(layout.visibility).every(visible => typeof visible === "boolean")) return undefined;
  return layout as DataTableColumnLayout;
}

/** Reconcile persisted/controlled layouts against the current column definitions. */
export function normalizeColumnLayout(columns: readonly ColumnLayoutDefinition[], value?: unknown): DataTableColumnLayout {
  const ids = columns.map(column => column.id);
  if (new Set(ids).size !== ids.length) throw new Error("DataTable column IDs must be unique.");
  const input = record(value), pins = record(input.pinning), visibility = record(input.visibility);
  const order = [...new Set([...strings(input.order).filter(id => ids.includes(id)), ...ids])];
  const pinnable = new Set(columns.filter(column => column.enablePinning !== false).map(column => column.id));
  const start = order.filter(id => pinnable.has(id) && strings(pins.start).includes(id));
  const end = order.filter(id => pinnable.has(id) && !start.includes(id) && strings(pins.end).includes(id));
  const visible = Object.fromEntries(columns.map(column => [column.id, column.enableHiding === false || visibility[column.id] !== false]));
  if (ids.length && !ids.some(id => visible[id])) visible[ids[0]] = true;
  return { order, visibility: visible, pinning: { start, end } };
}

export function columnRegion(layout: DataTableColumnLayout, id: string): ColumnRegion {
  return layout.pinning.start.includes(id) ? "start" : layout.pinning.end.includes(id) ? "end" : "center";
}
export function columnsInRegion(layout: DataTableColumnLayout, region: ColumnRegion, visibleOnly = false) {
  return layout.order.filter(id => columnRegion(layout, id) === region && (!visibleOnly || layout.visibility[id] !== false));
}

export function changeColumnLayout(columns: readonly ColumnLayoutDefinition[], input: DataTableColumnLayout, action: ColumnLayoutAction): DataTableColumnLayout {
  const layout = normalizeColumnLayout(columns, input);
  const column = columns.find(item => item.id === action.id);
  if (!column) return layout;
  if (action.type === "visibility") {
    if (!action.visible && (column.enableHiding === false || layout.order.filter(id => layout.visibility[id]).length <= 1)) return layout;
    return normalizeColumnLayout(columns, { ...layout, visibility: { ...layout.visibility, [action.id]: action.visible } });
  }
  if (action.type === "pin") {
    if (column.enablePinning === false || columnRegion(layout, action.id) === action.region) return layout;
    const order = layout.order.filter(id => id !== action.id);
    const destination = columnsInRegion(layout, action.region).filter(id => id !== action.id);
    order.splice(destination.length ? order.indexOf(destination[destination.length - 1]) + 1 : order.length, 0, action.id);
    const pinning = { start: layout.pinning.start.filter(id => id !== action.id), end: layout.pinning.end.filter(id => id !== action.id) };
    if (action.region !== "center") pinning[action.region].push(action.id);
    return normalizeColumnLayout(columns, { ...layout, order, pinning });
  }
  const region = columnRegion(layout, action.id);
  if (columnRegion(layout, action.target) !== region) return layout;
  const subset = columnsInRegion(layout, region, action.visibleOnly);
  const from = subset.indexOf(action.id), to = subset.indexOf(action.target);
  if (from < 0 || to < 0 || from === to) return layout;
  const reordered = [...subset];
  reordered.splice(to, 0, reordered.splice(from, 1)[0]);
  let index = 0;
  const order = layout.order.map(id => subset.includes(id) ? reordered[index++] : id);
  return normalizeColumnLayout(columns, { ...layout, order });
}
