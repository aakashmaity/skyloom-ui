import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaceholdersAndVanishInput, AnimationBoundary, CodeBlock, Compare, FileUpload, FloatingDock, Icon, LinkPreview, MultiStepLoader, Timeline } from "skyloom-ui";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("advanced component behavior", () => {
  it("validates upload type and size, deduplicates and removes files", () => {
    const change = vi.fn(), reject = vi.fn();
    render(<FileUpload accept=".txt" maxSize={4} onFilesChange={change} onReject={reject} />);
    const file = new File(["ok"], "notes.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("Upload files", { selector: "input" }), { target: { files: [file, file, new File(["image"], "photo.png"), new File(["too long"], "large.txt")] } });
    expect(change).toHaveBeenLastCalledWith([file]);
    expect(reject.mock.calls[0][0]).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    expect(change).toHaveBeenLastCalledWith([]);
  });

  it("pauses timed progress and allows externally controlled steps", () => {
    vi.useFakeTimers();
    const states = [{ text: "Preparing" }, { text: "Rendering" }];
    const view = render(<AnimationBoundary playing={false}><MultiStepLoader loading loadingStates={states} duration={100} presentation="inline" /></AnimationBoundary>);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText("Preparing", { selector: "li span" }).closest("li")?.getAttribute("aria-current")).toBe("step");
    view.rerender(<MultiStepLoader loading loadingStates={states} activeStep={1} presentation="inline" />);
    expect(screen.getByText("Rendering", { selector: "li span" }).closest("li")?.getAttribute("aria-current")).toBe("step");
    view.rerender(<MultiStepLoader loading={false} loadingStates={states} />);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("keeps comparison controlled and supplies a keyboard range control", () => {
    const change = vi.fn();
    render(<Compare before="Original" after="Updated" value={25} onValueChange={change} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "75" } });
    expect(change).toHaveBeenCalledWith(75);
    expect(slider.value).toBe("25");
  });

  it("connects code tabs to panels and preserves multiline syntax", () => {
    render(<CodeBlock tabs={[{ id: "one", filename: "one.js", language: "javascript", code: "/* first\nsecond */" }, { id: "two", filename: "two.js", code: "other" }]} />);
    const tab = screen.getByRole("tab", { name: "one.js" });
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.querySelectorAll(".token.comment")).toHaveLength(2);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "two.js" }), { button: 0, ctrlKey: false });
    expect(within(screen.getByRole("tabpanel")).getByText("other")).toBeTruthy();
  });

  it("aborts a custom preview when its last consumer unmounts", async () => {
    let signal: AbortSignal | undefined;
    const resolver = vi.fn((_url: string, value: AbortSignal) => { signal = value; return new Promise<{}>(() => {}); });
    const view = render(<LinkPreview href="https://example.com" provider="custom" resolve={resolver}>Example</LinkPreview>);
    fireEvent.click(screen.getByRole("button", { name: "Preview https://example.com" }));
    await act(async () => { await Promise.resolve(); });
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(signal?.aborted).toBe(false);
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });

  it("uses only list items as timeline list children", () => {
    render(<Timeline items={[{ id: "start", title: "Started", content: "A milestone" }]} />);
    expect(Array.from(screen.getByRole("list").children).every(node => node.tagName === "LI")).toBe(true);
  });
  it("keeps a successful preview visible beyond its request deadline", async () => {
    vi.useFakeTimers();
    render(<LinkPreview href="https://example.com/success" provider="custom" resolve={async () => ({ title: "Resolved preview" })}>Example</LinkPreview>);
    fireEvent.click(screen.getByRole("button", { name: "Preview https://example.com/success" }));
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByText("Resolved preview")).toBeTruthy();
    act(() => vi.advanceTimersByTime(16000));
    expect(screen.queryByText(/Preview unavailable/)).toBeNull();
    expect(screen.getByText("Resolved preview")).toBeTruthy();
  });

  it("ignores a late custom response after timeout", async () => {
    vi.useFakeTimers();
    let resolve!: (value: { title: string }) => void;
    const resolver = () => new Promise<{ title: string }>(done => { resolve = done; });
    render(<LinkPreview href="https://example.com/late" provider="custom" resolve={resolver}>Example</LinkPreview>);
    fireEvent.click(screen.getByRole("button", { name: "Preview https://example.com/late" }));
    await act(async () => { await Promise.resolve(); });
    act(() => vi.advanceTimersByTime(16000));
    await act(async () => resolve({ title: "Stale result" }));
    expect(screen.queryByText("Stale result")).toBeNull();
    expect(screen.getByText(/Preview unavailable/)).toBeTruthy();
  });

  it("associates the dock tooltip with its focused link", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    render(<FloatingDock items={[{ id: "home", label: "Home", href: "/", icon: <Icon name="menu" /> }]} />);
    const link = screen.getByRole("link", { name: "Home" });
    fireEvent.focus(link);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(link.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
  });

  it("finishes a non-looping message sequence without claiming request completion", () => {
    vi.useFakeTimers();
    const visible = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const view = render(<MultiStepLoader loading loadingStates={[{ text: "Preparing" }]} duration={100} loop={false} presentation="inline" />);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByText("Sequence finished. Waiting for your request.", { selector: "p.text-caption" })).toBeTruthy();
    view.unmount();
    visible.mockRestore();
  });

});

describe("expansion acceptance regressions", () => {
  it("does not submit a vanish input during IME composition", () => {
    const submit = vi.fn();
    render(<PlaceholdersAndVanishInput label="Compose" value="???" onValueChange={() => {}} onSubmit={submit} />);
    const input = screen.getByRole("textbox", { name: "Compose" });
    fireEvent.compositionStart(input);
    fireEvent.submit(input.closest("form")!);
    expect(submit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.submit(input.closest("form")!);
    expect(submit).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe("???");
  });

  it("requests Microlink only on intent and renders its mocked result", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "success", data: { title: "Mock website" } }) });
    vi.stubGlobal("fetch", fetcher);
    render(<LinkPreview href="https://example.com/mocked" provider="microlink">Website</LinkPreview>);
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Preview https://example.com/mocked" }));
    expect(await screen.findByText("Mock website")).toBeTruthy();
    expect(fetcher.mock.calls[0][0]).toContain("screenshot=true");
  });
});

it("hydrates simultaneous comparison instances without recoverable errors", async () => {
  const content = <><Compare before="Original" after="Updated" /><Compare before="Draft" after="Final" orientation="vertical" /></>;
  const container = document.createElement("div");
  container.innerHTML = renderToString(content);
  document.body.appendChild(container);
  const errors = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => { root = hydrateRoot(container, content, { onRecoverableError: errors }); });
  expect(errors).not.toHaveBeenCalled();
  expect(container.querySelectorAll('input[type="range"]')).toHaveLength(2);
  await act(async () => root!.unmount());
  container.remove();
});
