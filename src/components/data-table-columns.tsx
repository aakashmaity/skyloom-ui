"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { Button } from "./button";
import { Icon } from "./icon";
import { Switch } from "./switch";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "./sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./dropdown-menu";
import { columnRegion, columnsInRegion, type ColumnLayoutAction, type ColumnLayoutDefinition, type ColumnRegion, type DataTableColumnLayout } from "../lib/column-layout";
import { cn } from "../lib/utils";

type LayoutProps = { columns: readonly ColumnLayoutDefinition[]; layout: DataTableColumnLayout; change: (action: ColumnLayoutAction) => void };

export function ColumnDragScope({ children, columns, layout, change, visibleOnly = false, dragging }: LayoutProps & { children: ReactNode; visibleOnly?: boolean; dragging?: { current: boolean } }) {
  const [announcement, setAnnouncement] = useState("");
  return <DragDropProvider onDragStart={event => {
    if (dragging) dragging.current = true;
    setAnnouncement(`Moving ${event.operation.source?.data.label}. Use arrow keys to reorder, Enter to drop, Escape to cancel.`);
  }} onDragEnd={event => {
    if (dragging) setTimeout(() => { dragging.current = false; }, 0);
    const source = event.operation.source;
    if (!source || event.canceled || !isSortable(source)) { setAnnouncement("Column move cancelled."); return; }
    const id = String(source.id);
    const region = columnRegion(layout, id);
    const ids = columnsInRegion(layout, region, visibleOnly);
    const target = ids[source.index];
    if (source.group === source.initialGroup && target) {
      change({ type: "move", id, target, visibleOnly });
      setAnnouncement(`${columns.find(column => column.id === id)?.header} moved to position ${source.index + 1}.`);
    }
  }}>
    {children}
    <DragOverlay dropAnimation={null}>{source => <div className="sky-border rounded-control border-primary bg-popover p-inline text-popover-foreground shadow-floating">{String(source.data.label ?? "Column")}</div>}</DragOverlay>
    <span className="sr-only" role="status">{announcement}</span>
  </DragDropProvider>;
}

function useColumnSortable(column: ColumnLayoutDefinition, layout: DataTableColumnLayout, visibleOnly: boolean) {
  const region = columnRegion(layout, column.id);
  return useSortable({ id: column.id, index: columnsInRegion(layout, region, visibleOnly).indexOf(column.id), group: region, type: region, accept: region, data: { label: column.header }, transition: null });
}

function canHide(column: ColumnLayoutDefinition, layout: DataTableColumnLayout) {
  return column.enableHiding !== false && (layout.visibility[column.id] === false || layout.order.filter(id => layout.visibility[id]).length > 1);
}

export function ManagedColumnHead({ column, layout, change, style, pinned }: Omit<LayoutProps, "columns"> & { column: ColumnLayoutDefinition; style?: CSSProperties; pinned?: string }) {
  const { ref, handleRef, isDropTarget } = useColumnSortable(column, layout, true);
  const region = columnRegion(layout, column.id);
  return <th ref={ref} scope="col" data-column-id={column.id} data-pinned={pinned} style={style} className={cn("sky-table-cell px-inline py-control text-start text-label font-medium text-muted-foreground", isDropTarget && "sky-column-target")}>
    <div className="flex items-center gap-control">
      <Button ref={handleRef} variant="ghost" size="icon" className="sky-drag-handle shrink-0" aria-label={`Move ${column.header} column`}><Icon name="grip" /></Button>
      <span className="min-w-0 wrap-break-word">{column.header}</span>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="ms-auto shrink-0" aria-label={`${column.header} column options`}><Icon name="more-horizontal" /></Button></DropdownMenuTrigger><DropdownMenuContent>
        <DropdownMenuItem disabled={column.enablePinning === false || region === "start"} onSelect={() => change({ type: "pin", id: column.id, region: "start" })}>Pin to start</DropdownMenuItem>
        <DropdownMenuItem disabled={column.enablePinning === false || region === "end"} onSelect={() => change({ type: "pin", id: column.id, region: "end" })}>Pin to end</DropdownMenuItem>
        <DropdownMenuItem disabled={region === "center"} onSelect={() => change({ type: "pin", id: column.id, region: "center" })}>Unpin</DropdownMenuItem>
        <DropdownMenuItem disabled={!canHide(column, layout)} onSelect={() => change({ type: "visibility", id: column.id, visible: false })}>Hide column</DropdownMenuItem>
      </DropdownMenuContent></DropdownMenu>
    </div>
  </th>;
}

function ColumnManagerRow({ column, layout, change }: Omit<LayoutProps, "columns"> & { column: ColumnLayoutDefinition }) {
  const { ref, handleRef, isDropTarget } = useColumnSortable(column, layout, false);
  const region = columnRegion(layout, column.id);
  const group = columnsInRegion(layout, region);
  const index = group.indexOf(column.id);
  return <li ref={ref} className={cn("sky-border grid gap-control rounded-control border-border bg-card p-control text-card-foreground", isDropTarget && "sky-column-target")}>
    <div className="flex items-center gap-control">
      <Button ref={handleRef} variant="ghost" size="icon" className="sky-drag-handle shrink-0" aria-label={`Reorder ${column.header}`}><Icon name="grip" /></Button>
      <span className="min-w-0 flex-1 wrap-break-word font-medium">{column.header}</span>
      <Switch aria-label={`Show ${column.header}`} checked={layout.visibility[column.id]} disabled={!canHide(column, layout)} onCheckedChange={visible => change({ type: "visibility", id: column.id, visible })} />
    </div>
    <div className="flex flex-wrap items-center gap-control">
      <label className="flex min-w-0 flex-1 items-center gap-control text-label">Pin
        <span className="relative min-w-0 flex-1"><select aria-label={`Pin ${column.header}`} value={region} disabled={column.enablePinning === false} className="sky-focus sky-border sky-disabled min-h-touch w-full min-w-0 appearance-none rounded-control border-input bg-background ps-control pe-field text-body text-foreground tablet:min-h-field tablet:text-label" onChange={event => change({ type: "pin", id: column.id, region: event.target.value as ColumnRegion })}>
          <option value="center">Unpinned</option><option value="start">Start</option><option value="end">End</option>
        </select><Icon name="chevron-down" className="pointer-events-none absolute end-control top-1/2 -translate-y-1/2 text-muted-foreground" /></span>
      </label>
      <Button size="icon" variant="ghost" aria-label={`Move ${column.header} up`} disabled={index === 0} onClick={() => change({ type: "move", id: column.id, target: group[index - 1] })}><Icon name="arrow-up" /></Button>
      <Button size="icon" variant="ghost" aria-label={`Move ${column.header} down`} disabled={index === group.length - 1} onClick={() => change({ type: "move", id: column.id, target: group[index + 1] })}><Icon name="arrow-down" /></Button>
    </div>
  </li>;
}

export function DataTableColumnManager({ columns, layout, change, reset, disabled }: LayoutProps & { reset: () => void; disabled?: boolean }) {
  const dragging = useRef(false);
  return <Sheet><SheetTrigger asChild><Button variant="outline" disabled={disabled}>Manage columns</Button></SheetTrigger>
    <SheetContent side="left" className="flex flex-col overflow-hidden" onEscapeKeyDown={event => { if (dragging.current) event.preventDefault(); }}>
      <div className="grid shrink-0 gap-control"><SheetTitle>Manage columns</SheetTitle><SheetDescription>Drag to reorder, toggle visibility, or choose a pin position.</SheetDescription><p className="text-caption text-muted-foreground">{layout.order.filter(id => layout.visibility[id]).length} of {columns.length} visible &middot; Changes apply immediately</p></div>
      <div className="min-h-0 flex-1 overflow-y-auto pe-control">
      <ColumnDragScope columns={columns} layout={layout} change={change} dragging={dragging}>
        <div className="grid gap-panel">{(["start", "center", "end"] as const).map(region => <section key={region} aria-label={region === "center" ? "Unpinned columns" : `Pinned ${region} columns`}>
          <h3 className="mb-control text-caption font-semibold text-muted-foreground">{region === "center" ? "Unpinned" : `Pinned ${region}`}</h3>
          <ul className="grid gap-control">{columnsInRegion(layout, region).map(id => <ColumnManagerRow key={id} column={columns.find(column => column.id === id)!} layout={layout} change={change} />)}</ul>
          {!columnsInRegion(layout, region).length && <p className="text-caption text-muted-foreground">No columns in this group.</p>}
        </section>)}</div>
      </ColumnDragScope>
      <p className="mt-stack text-caption text-muted-foreground">Start follows reading direction. Use the arrow buttons as an alternative to dragging.</p></div>
      <SheetFooter className="shrink-0"><Button variant="outline" onClick={reset}>Reset columns</Button><SheetClose asChild><Button>Done</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>;
}
