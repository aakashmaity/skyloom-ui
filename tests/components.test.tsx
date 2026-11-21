import { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, MultiSelect, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, Switch, Tabs, TabsList, TabsTrigger, TabsContent, SelectField, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "skyloom-ui";

describe("shared controls", () => {
  it("does not submit a surrounding form by default", async () => {
    let submitted = false;
    render(<form onSubmit={e => { e.preventDefault(); submitted = true; }}><Button>Action</Button></form>);
    await userEvent.click(screen.getByRole("button", { name: "Action" }));
    expect(submitted).toBe(false);
  });

  it("selects enabled options, preserves disabled selections, and exposes a mixed state", async () => {
    function Harness() {
      const [value, setValue] = useState(["fixed", "a"]);
      return <MultiSelect label="Categories" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }, { value: "fixed", label: "Fixed", disabled: true }]} value={value} onValueChange={setValue} />;
    }
    render(<Harness />);
    const all = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    await userEvent.click(all);
    expect(all.checked).toBe(true);
    expect((screen.getByLabelText("B") as HTMLInputElement).checked).toBe(true);
    await userEvent.click(all);
    expect((screen.getByLabelText("A") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText("Fixed") as HTMLInputElement).checked).toBe(true);
  });

  it("disables select all for an empty option set", () => {
    render(<MultiSelect label="Empty" options={[]} value={[]} onValueChange={() => {}} />);
    expect((screen.getByLabelText("Select all") as HTMLInputElement).disabled).toBe(true);
  });

  it("opens a modal, contains keyboard focus, and restores focus on Escape", async () => {
    render(<Dialog><DialogTrigger asChild><Button>Open details</Button></DialogTrigger><DialogContent><DialogTitle>Details</DialogTitle><DialogDescription>Product information</DialogDescription><Button>Add item</Button></DialogContent></Dialog>);
    const trigger = screen.getByRole("button", { name: "Open details" });
    await userEvent.click(trigger);
    const modal = screen.getByRole("dialog", { name: "Details" });
    for (let i = 0; i < 4; i++) { await userEvent.tab(); expect(modal.contains(document.activeElement)).toBe(true); }
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("provides the same modal semantics for sheets", async () => {
    render(<Sheet><SheetTrigger asChild><Button>Cart</Button></SheetTrigger><SheetContent><SheetTitle>Your cart</SheetTitle><SheetDescription>Items to buy</SheetDescription></SheetContent></Sheet>);
    await userEvent.click(screen.getByRole("button", { name: "Cart" }));
    expect(screen.getByRole("dialog", { name: "Your cart" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports keyboard toggling a switch", async () => {
    render(<Switch aria-label="Dark theme" />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  });

  it("supports arrow navigation between tabs", async () => {
    render(<Tabs defaultValue="a"><TabsList aria-label="Product"><TabsTrigger value="a">Details</TabsTrigger><TabsTrigger value="b">Delivery</TabsTrigger></TabsList><TabsContent value="a">Details panel</TabsContent><TabsContent value="b">Delivery panel</TabsContent></Tabs>);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Delivery" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Delivery panel");
  });

  it("labels a select, links errors, and supports keyboard selection", async () => {
    function Harness() {
      const [value, setValue] = useState("");
      return <SelectField id="sort" label="Sort" value={value} onValueChange={setValue} error="Choose a sort order" options={[{ value: "price", label: "Price" }, { value: "name", label: "Name" }]} />;
    }
    render(<Harness />);
    const trigger = screen.getByRole("combobox", { name: "Sort" });
    expect(trigger.getAttribute("aria-describedby")).toBe("sort-error");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Home}{Enter}");
    expect(trigger.textContent).toContain("Price");
  });

  it("expands an accordion using the keyboard", async () => {
    render(<Accordion type="single" collapsible><AccordionItem value="shipping"><AccordionTrigger>Shipping</AccordionTrigger><AccordionContent>Free delivery</AccordionContent></AccordionItem></Accordion>);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Shipping" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Free delivery")).toBeTruthy();
  });
});
