import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptInput, type PromptInputProps } from "../packages/sky-ui/src";

function Harness({ onSubmit = () => {}, ...props }: Partial<PromptInputProps>) {
  const [value, setValue] = useState("");
  return <PromptInput value={value} onValueChange={setValue} onSubmit={onSubmit} {...props} />;
}

describe("prompt composer", () => {
  it("rejects whitespace and sends trimmed text by keyboard and submit button without clearing controlled state", async () => {
    const submit = vi.fn();
    render(<Harness onSubmit={submit} />);
    const input = screen.getByRole("textbox", { name: "Message" });
    const button = screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await userEvent.type(input, "   {Enter}");
    expect(submit).not.toHaveBeenCalled();
    await userEvent.type(input, "Hello  {Enter}");
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0][0]).toBe("Hello");
    expect((input as HTMLTextAreaElement).value).toBe("   Hello  ");
    await userEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("preserves Shift+Enter and does not submit while an IME is composing", async () => {
    const submit = vi.fn();
    render(<Harness onSubmit={submit} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "First{Shift>}{Enter}{/Shift}Second");
    expect((input as HTMLTextAreaElement).value).toBe("First\nSecond");
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(submit).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it.each(["submitted", "streaming"] as const)("blocks resubmission and allows cancellation when %s", async status => {
    const submit = vi.fn(), stop = vi.fn();
    render(<Harness status={status} onSubmit={submit} onStop={stop} />);
    await userEvent.type(screen.getByRole("textbox"), "Next message{Enter}");
    expect(submit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /Stop response/ }));
    expect(stop).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  it("disables all controls and guards programmatic submission", async () => {
    const submit = vi.fn();
    const form = createRef<HTMLFormElement>();
    render(<Harness ref={form} disabled value="Existing draft" onSubmit={submit} />);
    await userEvent.type(screen.getByRole("textbox"), "Changed");
    fireEvent.submit(form.current!);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Existing draft");
    expect(submit).not.toHaveBeenCalled();
  });

  it("preserves textarea refs, custom labels, and a caller's prevented keyboard event", async () => {
    const submit = vi.fn();
    const ref = createRef<HTMLTextAreaElement>();
    render(<Harness label="Ask a question" onSubmit={submit} textareaProps={{ ref, onKeyDown: event => event.preventDefault() }} />);
    expect(screen.getByLabelText("Ask a question")).toBe(ref.current);
    fireEvent.change(ref.current!, { target: { value: "Hello" } });
    fireEvent.keyDown(ref.current!, { key: "Enter" });
    expect(submit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("allows retry after an error and disables cancellation when no stop handler exists", async () => {
    const submit = vi.fn();
    const { rerender } = render(<Harness status="streaming" />);
    expect((screen.getByRole("button", { name: /Stop response/ }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<Harness status="error" onSubmit={submit} />);
    await userEvent.type(screen.getByRole("textbox"), "Retry{Enter}");
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
