"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { createPaginatedRowModel, rowPaginationFeature, columnOrderingFeature, columnPinningFeature, columnVisibilityFeature, tableFeatures, useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Pagination } from "./pagination";
import { Input, Label } from "./fields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useColumnLayout } from "./use-column-layout";
import { useColumnPinning } from "./use-column-pinning";
import { ColumnDragScope, DataTableColumnManager, ManagedColumnHead } from "./data-table-columns";
import type { DataTableColumnLayout } from "../lib/column-layout";

const features = tableFeatures({ rowPaginationFeature, columnOrderingFeature, columnPinningFeature, columnVisibilityFeature, paginatedRowModel: createPaginatedRowModel() });
export type DataTableColumn<T> = { id: string; header: string; cell: (row: T) => ReactNode; enableHiding?: boolean; enablePinning?: boolean };
export type DataTableProps<T extends RowData> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  caption: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchText?: (row: T) => string;
  searchLabel?: string;
  loading?: boolean;
  error?: string;
  columnManagement?: boolean;
  columnLayout?: DataTableColumnLayout;
  defaultColumnLayout?: DataTableColumnLayout;
  onColumnLayoutChange?: (layout: DataTableColumnLayout) => void;
  columnLayoutStorageKey?: string;
};

/** Client pagination: pass the complete dataset. Filter before paginating. */
export function DataTable<T extends RowData>({ data, columns, getRowId, caption, initialPageSize = 10, pageSizeOptions = [5, 10, 25, 50], searchText, searchLabel = "Search rows", loading = false, error, columnManagement = true, columnLayout, defaultColumnLayout, onColumnLayoutChange, columnLayoutStorageKey }: DataTableProps<T>) {
  const id = useId();
  const { layout, change, reset } = useColumnLayout(columns, columnLayout, defaultColumnLayout, onColumnLayoutChange, columnLayoutStorageKey);
  const pinning = useColumnPinning(layout);
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: Number.isInteger(initialPageSize) && initialPageSize > 0 ? initialPageSize : 10 });
  const filtered = useMemo(() => searchText ? data.filter(row => searchText(row).toLowerCase().includes(query.trim().toLowerCase())) : data, [data, query, searchText]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pagination.pageSize));
  const safePagination = { ...pagination, pageIndex: Math.min(pagination.pageIndex, pageCount - 1) };
  const definitions = useMemo<ColumnDef<typeof features, T>[]>(() => columns.map(column => ({ id: column.id, header: column.header, enableHiding: column.enableHiding, enablePinning: column.enablePinning, cell: ({ row }) => column.cell(row.original) })), [columns]);
  const table = useTable({ features, data: filtered, columns: definitions, getRowId, state: { pagination: safePagination, columnOrder: layout.order, columnVisibility: layout.visibility, columnPinning: layout.pinning }, onPaginationChange: setPagination, autoResetPageIndex: false });
  const options = [...new Set([...pageSizeOptions, pagination.pageSize])].filter(size => Number.isInteger(size) && size > 0).sort((a, b) => a - b);
  const unavailable = loading || !!error;
  const start = filtered.length ? safePagination.pageIndex * pagination.pageSize + 1 : 0;
  const end = Math.min((safePagination.pageIndex + 1) * pagination.pageSize, filtered.length);
  const content = <div className="sky-border min-w-0 overflow-hidden rounded-surface border-border"><Table ref={pinning.tableRef} className="sky-managed-table"><TableCaption>{caption}</TableCaption><TableHeader>{table.getHeaderGroups().map(group => <TableRow key={group.id}>{group.headers.map(header => {
    const column = columns.find(item => item.id === header.column.id)!;
    const props = pinning.cellProps(column.id);
    return columnManagement ? <ManagedColumnHead key={header.id} column={column} layout={layout} change={change} style={props.style} pinned={props["data-pinned"]} /> : <TableHead key={header.id} className="sky-table-cell" data-column-id={column.id} {...props}><table.FlexRender header={header} /></TableHead>;
  })}</TableRow>)}</TableHeader><TableBody>
    {unavailable || !filtered.length ? <TableRow><TableCell colSpan={Math.max(1, table.getVisibleLeafColumns().length)} className="p-panel text-center"><span role={error ? "alert" : "status"}>{loading ? "Loading rows…" : error ?? "No matching rows."}</span></TableCell></TableRow> : table.getRowModel().rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id} className="sky-table-cell" {...pinning.cellProps(cell.column.id)}><table.FlexRender cell={cell} /></TableCell>)}</TableRow>)}
  </TableBody></Table></div>;
  return <div className="grid min-w-0 gap-stack" aria-busy={loading}>
    <div className="flex flex-col gap-stack tablet:flex-row tablet:flex-wrap tablet:items-end tablet:justify-between">
      {searchText && <div className="grid w-full gap-control tablet:max-w-preview-wide"><Label htmlFor={`${id}-search`}>{searchLabel}</Label><Input id={`${id}-search`} value={query} disabled={unavailable} placeholder="Filter results…" onChange={event => { setQuery(event.target.value); setPagination(current => ({ ...current, pageIndex: 0 })); }} /></div>}
      <div className="grid shrink-0 gap-control"><Label htmlFor={`${id}-size`}>Rows per page</Label><Select value={String(pagination.pageSize)} disabled={unavailable} onValueChange={value => setPagination({ pageIndex: 0, pageSize: Number(value) })}><SelectTrigger id={`${id}-size`} className="w-auto"><SelectValue /></SelectTrigger><SelectContent>{options.map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select></div>
      {columnManagement && <DataTableColumnManager columns={columns} layout={layout} change={change} reset={reset} />}
    </div>
    {columnManagement ? <ColumnDragScope columns={columns} layout={layout} change={change} visibleOnly>{content}</ColumnDragScope> : content}
    {pinning.suspended && <p className="text-caption text-muted-foreground">Pinned columns will stick when there is enough space. Scroll horizontally to view all columns.</p>}
    {!unavailable && <><p role="status" className="text-caption text-muted-foreground">Showing {start}–{end} of {filtered.length} rows</p><Pagination page={safePagination.pageIndex + 1} pageCount={pageCount} onPageChange={page => setPagination(current => ({ ...current, pageIndex: page - 1 }))} label={`${caption} pagination`} /></>}
  </div>;
}
