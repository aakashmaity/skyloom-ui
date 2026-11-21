import { describe, expect, it, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "skyloom-ui";

const data = Array.from({ length: 12 }, (_, index) => ({ id: `row-${index + 1}`, name: `Item ${index + 1}` }));
const columns: DataTableColumn<(typeof data)[number]>[] = [{ id: "name", header: "Name", cell: row => row.name }];
const search = (row: (typeof data)[number]) => row.name;
const id = (row: (typeof data)[number]) => row.id;

describe("DataTable pagination", () => {
  it("paginates actual rows and handles a partial final page", async () => {
    render(<DataTable data={data} columns={columns} getRowId={id} caption="Items" initialPageSize={5} />);
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.queryByText("Item 6")).toBeNull();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Item 6")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Showing 11–12 of 12 rows")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("filters before pagination and resets the page", async () => {
    render(<DataTable data={data} columns={columns} getRowId={id} caption="Items" initialPageSize={5} searchText={search} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.type(screen.getByLabelText("Search rows"), "Item 12");
    expect(screen.getByText("Item 12")).toBeTruthy();
    expect(screen.getByText("Showing 1–1 of 1 rows")).toBeTruthy();
    await userEvent.clear(screen.getByLabelText("Search rows"));
    await userEvent.type(screen.getByLabelText("Search rows"), "missing");
    expect(screen.getByText("No matching rows.")).toBeTruthy();
    expect(screen.getByText("Showing 0–0 of 0 rows")).toBeTruthy();
  });
  it("changes page size and clamps the page when the dataset shrinks", async () => {
    const { rerender } = render(<DataTable data={data} columns={columns} getRowId={id} caption="Items" initialPageSize={5} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await userEvent.click(screen.getByRole("option", { name: "10", exact: true }));
    expect(screen.getByText("Showing 1–10 of 12 rows")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    rerender(<DataTable data={data.slice(0, 2)} columns={columns} getRowId={id} caption="Items" initialPageSize={5} />);
    expect(screen.getByText("Showing 1–2 of 2 rows")).toBeTruthy();
    expect(screen.getByText("Item 1")).toBeTruthy();
  });
  it("shows loading and errors without misleading stale pagination", () => {
    const { rerender } = render(<DataTable data={data} columns={columns} getRowId={id} caption="Items" loading />);
    expect(screen.getByText("Loading rows…")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
    rerender(<DataTable data={data} columns={columns} getRowId={id} caption="Items" error="Unable to load" />);
    expect(screen.getByRole("alert").textContent).toBe("Unable to load");
  });
});

describe("DataTable column manager", () => {
  const managedColumns: DataTableColumn<(typeof data)[number]>[] = [
    { id: "id", header: "ID", cell: row => row.id, enableHiding: false },
    ...columns,
    { id: "extra", header: "Extra", cell: row => `Extra ${row.id}` },
  ];
  it.each([null, {}, { order: "invalid" }, { order: [], visibility: { name: "false" }, pinning: { start: [], end: [] } }])("keeps configured defaults when saved layout is malformed (%j)", async saved => {
    localStorage.setItem("invalid-columns", JSON.stringify({ version: 1, layout: saved }));
    const defaults = { order: ["extra", "id", "name"], visibility: { extra: true, id: true, name: false }, pinning: { start: [], end: [] } };
    render(<DataTable data={data} columns={managedColumns} getRowId={id} caption="Recovery" defaultColumnLayout={defaults} columnLayoutStorageKey="invalid-columns" />);
    expect(screen.getAllByRole("columnheader").map(node => node.getAttribute("data-column-id"))).toEqual(["extra", "id"]);
    localStorage.removeItem("invalid-columns");
  });
  it("remeasures the replacement table when column management changes", async () => {
    const oldStyle = document.documentElement.getAttribute("style");
    document.documentElement.style.fontSize = "16px";
    document.documentElement.style.setProperty("--sky-table-center-min", "12rem");
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return { width: this.querySelector("button") ? 150 : 80 } as DOMRect;
    });
    const layout = { order: ["id", "name", "extra"], visibility: { id: true, name: true, extra: true }, pinning: { start: ["id", "name"], end: [] } };
    try {
      const props = { data, columns: managedColumns, getRowId: id, caption: "Measured", defaultColumnLayout: layout };
      const { rerender, unmount } = render(<DataTable {...props} />);
      const second = () => screen.getAllByRole("columnheader")[1] as HTMLElement;
      await waitFor(() => expect(second().style.insetInlineStart).toBe("150px"));
      rerender(<DataTable {...props} columnManagement={false} />);
      await waitFor(() => expect(second().style.insetInlineStart).toBe("80px"));
      unmount();
    } finally {
      vi.restoreAllMocks(); vi.unstubAllGlobals();
      if (oldStyle === null) document.documentElement.removeAttribute("style");
      else document.documentElement.setAttribute("style", oldStyle);
    }
  });
  it("reorders and hides columns without resetting the current page, and restores focus", async () => {
    render(<DataTable data={data} columns={managedColumns} getRowId={id} caption="Managed" initialPageSize={5} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    const trigger = screen.getByRole("button", { name: "Manage columns" });
    await userEvent.click(trigger);
    const drawer = screen.getByRole("dialog", { name: "Manage columns" });
    await userEvent.click(within(drawer).getByRole("button", { name: "Move Extra up" }));
    await userEvent.click(within(drawer).getByRole("switch", { name: "Show Name" }));
    expect((within(drawer).getByRole("switch", { name: "Show ID" }) as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(within(drawer).getByRole("button", { name: "Done" }));
    expect(screen.getAllByRole("columnheader").map(node => node.querySelector("span.min-w-0")?.textContent)).toEqual(["ID", "Extra"]);
    expect(screen.getByText("Showing 6–10 of 12 rows")).toBeTruthy();
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByText("Item 6")).toBeNull();
  });
  it("pins hidden columns, persists a layout, and resets to supplied defaults", async () => {
    localStorage.removeItem("test-columns");
    const defaults = { order: ["extra", "id", "name"], visibility: { extra: true, id: true, name: false }, pinning: { start: [], end: [] } };
    const props = { data, columns: managedColumns, getRowId: id, caption: "Managed", defaultColumnLayout: defaults, columnLayoutStorageKey: "test-columns" };
    const first = render(<DataTable {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Manage columns" }));
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Pin Extra" }), "start");
    await userEvent.click(screen.getByRole("switch", { name: "Show Extra" }));
    first.unmount();
    render(<DataTable {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Manage columns" }));
    expect((screen.getByRole("combobox", { name: "Pin Extra" }) as HTMLSelectElement).value).toBe("start");
    expect(screen.getByRole("switch", { name: "Show Extra" }).getAttribute("aria-checked")).toBe("false");
    await userEvent.click(screen.getByRole("button", { name: "Reset columns" }));
    expect((screen.getByRole("combobox", { name: "Pin Extra" }) as HTMLSelectElement).value).toBe("center");
    expect(screen.getByRole("switch", { name: "Show Extra" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("switch", { name: "Show Name" }).getAttribute("aria-checked")).toBe("false");
    localStorage.removeItem("test-columns");
  });
  it("emits controlled changes without overwriting caller state or storage", async () => {
    const layout = { order: ["id", "name", "extra"], visibility: { id: true, name: true, extra: true }, pinning: { start: [], end: [] } };
    const onChange = vi.fn();
    const props = { data, columns: managedColumns, getRowId: id, caption: "Controlled", columnLayoutStorageKey: "controlled-columns", onColumnLayoutChange: onChange };
    const { rerender } = render(<DataTable {...props} columnLayout={layout} />);
    await userEvent.click(screen.getByRole("button", { name: "Manage columns" }));
    await userEvent.click(screen.getByRole("switch", { name: "Show Name" }));
    const next = onChange.mock.calls[0][0];
    expect(next.visibility.name).toBe(false);
    expect(screen.getByRole("switch", { name: "Show Name" }).getAttribute("aria-checked")).toBe("true");
    expect(localStorage.getItem("controlled-columns")).toBeNull();
    rerender(<DataTable {...props} columnLayout={next} />);
    expect(screen.getByRole("switch", { name: "Show Name" }).getAttribute("aria-checked")).toBe("false");
  });
});
