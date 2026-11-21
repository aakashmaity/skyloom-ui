// @vitest-environment node
import { describe, expect, it } from "vitest";
import { changeColumnLayout, columnsInRegion, normalizeColumnLayout } from "../packages/sky-ui/src/lib/column-layout";

const columns = ["a", "b", "c", "d"].map(id => ({ id, header: id }));
describe("column layout transitions", () => {
  it("reconciles stale, duplicate, and malformed stored IDs", () => {
    const layout = normalizeColumnLayout(columns, { order: ["b", "b", "gone"], visibility: { b: false }, pinning: { start: ["c", "gone"], end: ["c", "d"] } });
    expect(layout.order).toEqual(["b", "a", "c", "d"]);
    expect(layout.pinning).toEqual({ start: ["c"], end: ["d"] });
    expect(layout.visibility).toEqual({ a: true, b: false, c: true, d: true });
    expect(normalizeColumnLayout(columns, null).order).toEqual(["a", "b", "c", "d"]);
    expect(() => normalizeColumnLayout([columns[0], columns[0]])).toThrow("unique");
  });
  it("moves visible columns while preserving hidden slots", () => {
    const initial = normalizeColumnLayout(columns, { visibility: { b: false } });
    const next = changeColumnLayout(columns, initial, { type: "move", id: "a", target: "d", visibleOnly: true });
    expect(next.order).toEqual(["c", "b", "d", "a"]);
    expect(changeColumnLayout(columns, next, { type: "visibility", id: "b", visible: true }).order).toEqual(next.order);
  });
  it("keeps drag moves in their pin group and appends explicitly pinned columns", () => {
    const initial = normalizeColumnLayout(columns, { pinning: { start: ["a"] } });
    expect(changeColumnLayout(columns, initial, { type: "move", id: "c", target: "a" })).toEqual(initial);
    const pinned = changeColumnLayout(columns, initial, { type: "pin", id: "d", region: "start" });
    expect(columnsInRegion(pinned, "start")).toEqual(["a", "d"]);
    const unpinned = changeColumnLayout(columns, pinned, { type: "pin", id: "a", region: "center" });
    expect(columnsInRegion(unpinned, "center")).toEqual(["b", "c", "a"]);
  });
  it("keeps hidden pinned columns configured and permits drawer reordering", () => {
    let layout = normalizeColumnLayout(columns, { visibility: { b: false }, pinning: { end: ["b", "c"] } });
    layout = changeColumnLayout(columns, layout, { type: "move", id: "b", target: "c" });
    expect(layout.pinning.end).toEqual(["c", "b"]);
    expect(columnsInRegion(layout, "end", true)).toEqual(["c"]);
    layout = changeColumnLayout(columns, layout, { type: "visibility", id: "b", visible: true });
    expect(columnsInRegion(layout, "end", true)).toEqual(["c", "b"]);
  });
  it("protects the final visible column and respects capabilities", () => {
    const defs = [{ id: "a", header: "a", enableHiding: false, enablePinning: false }, columns[1]];
    let layout = normalizeColumnLayout(defs, { visibility: { a: false, b: false }, pinning: { start: ["a"] } });
    expect(layout.visibility).toEqual({ a: true, b: false });
    expect(layout.pinning.start).toEqual([]);
    expect(changeColumnLayout(defs, layout, { type: "visibility", id: "a", visible: false })).toEqual(layout);
    layout = normalizeColumnLayout(columns, { visibility: { b: false, c: false, d: false } });
    expect(changeColumnLayout(columns, layout, { type: "visibility", id: "a", visible: false })).toEqual(layout);
  });
});
