import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentPlayground } from "../apps/docs/src/features/design-system/component-playground";
import { playgrounds, playgroundExamples } from "../apps/docs/src/features/design-system/playgrounds";
import { examples } from "../apps/docs/src/features/design-system/examples";
import { Suggestions, TaskPlan, ToolStatus } from "skyloom-ui";

describe("component playground", () => {
  it("covers every catalog entry with supported controls and standalone code", () => {
    for (const example of [...examples, ...playgroundExamples]) {
      const definition = playgrounds[example.id];
      expect(definition, example.id).toBeDefined();
      expect(definition.controls.length).toBeGreaterThan(0);
      for (const control of definition.controls) for (const option of control.options) {
        const source = definition.source({ ...definition.defaults, [control.key]: option });
        expect(source).toContain("export function ComponentPreview()");
        expect(source).not.toContain("undefined");
      }
    }
  });
  it("updates rendered variants and code, compares choices, selects and resets", async () => {
    render(<ComponentPlayground name="Button" definition={playgrounds.button} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Variant", exact: true }));
    await userEvent.click(screen.getByRole("option", { name: "Success", exact: true }));
    expect(screen.getByRole("button", { name: "Continue" }).className).toContain("bg-success");
    fireEvent.click(screen.getByText("Selected configuration code"));
    expect(screen.getByLabelText("Button configuration code").textContent).toContain('variant="success"');
    await userEvent.click(screen.getByRole("switch", { name: "Compare options" }));
    expect(screen.getAllByRole("button", { name: "Continue" })).toHaveLength(10);
    await userEvent.click(screen.getByRole("button", { name: "Use Classic" }));
    expect(screen.getByLabelText("Button configuration code").textContent).toContain('variant="classic"');
    await userEvent.click(screen.getByRole("button", { name: "Reset playground" }));
    expect(screen.getAllByRole("button", { name: "Continue" })).toHaveLength(1);
    expect(screen.getByLabelText("Button configuration code").textContent).toContain('variant="default"');
  });
  it("keeps compared form labels unique and connects their errors", async () => {
    render(<ComponentPlayground name="Input" definition={playgrounds.input} />);
    await userEvent.click(screen.getByRole("combobox", { name: "State", exact: true }));
    await userEvent.click(screen.getByRole("option", { name: "Invalid", exact: true }));
    await userEvent.click(screen.getByRole("switch", { name: "Compare options" }));
    const inputs = screen.getAllByRole("textbox", { name: "Display name" });
    expect(new Set(inputs.map(input => input.id)).size).toBe(4);
    for (const input of inputs) expect(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent).toBe("Please review this value.");
  });
});

describe("advanced AI primitives", () => {
  it("sends the selected suggestion once and respects disabled", async () => {
    const onSelect = vi.fn();
    const { rerender } = render(<Suggestions items={["Summarize"]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Summarize" }));
    expect(onSelect).toHaveBeenCalledWith("Summarize");
    rerender(<Suggestions items={["Summarize"]} onSelect={onSelect} disabled />);
    await userEvent.click(screen.getByRole("button", { name: "Summarize" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
  it("supports controlled disclosure and independent plan steps", async () => {
    const onOpenChange = vi.fn();
    const { rerender, unmount } = render(<ToolStatus title="Search" status="running" open={false} onOpenChange={onOpenChange}>Results</ToolStatus>);
    await userEvent.click(screen.getByRole("button", { name: "Search Running" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Results")).toBeNull();
    rerender(<ToolStatus title="Search" status="complete" open>Results</ToolStatus>);
    expect(screen.getByText("Results")).toBeTruthy();
    unmount();
    render(<TaskPlan title="Release" steps={[{ id: "a", title: "Review", status: "complete", description: "Reviewed changes" }, { id: "b", title: "Build", status: "error", description: "Build failed" }]} />);
    const plan = within(screen.getByRole("region", { name: "Release" }));
    await userEvent.click(plan.getByRole("button", { name: "Build Error" }));
    expect(plan.getByText("Build failed")).toBeTruthy();
    expect(plan.queryByText("Reviewed changes")).toBeNull();
  });
});
