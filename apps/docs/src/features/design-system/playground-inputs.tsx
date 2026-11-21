"use client";

import { useId, useState } from "react";
import { Button, ButtonGroup, Checkbox, FormField, Input, Kbd, Label, Message, MessageContent, MultiSelect, PromptInput, RadioGroup, RadioGroupItem, SelectField, Slider, Stack, Switch, Textarea } from "skyloom-ui";
import { appearanceStyles, buttonStyles, fieldStyles, playground } from "./playground-model";

const fieldStates = ["enabled", "disabled", "invalid", "read-only"] as const;
function FieldPreview({ variant, state, multiline = false }: { variant: typeof fieldStyles[number]; state: typeof fieldStates[number]; multiline?: boolean }) {
  const id = useId();
  const Field = multiline ? Textarea : Input;
  return <FormField id={id} label={multiline ? "Notes" : "Display name"} error={state === "invalid" ? "Please review this value." : undefined}><Field id={id} variant={variant} placeholder="Type here…" defaultValue={state === "read-only" ? "Read-only content" : undefined} disabled={state === "disabled"} readOnly={state === "read-only"} aria-invalid={state === "invalid"} aria-describedby={state === "invalid" ? `${id}-error` : undefined} /></FormField>;
}
function field(multiline: boolean) {
  const tag = multiline ? "Textarea" : "Input";
  return playground({ choices: { variant: fieldStyles, state: fieldStates }, imports: `FormField, ${tag}`, setup: () => 'const id = useId();',
    render: values => <FieldPreview {...values} multiline={multiline} />,
    code: ({ variant, state }) => `<FormField id={id} label="${multiline ? "Notes" : "Display name"}"${state === "invalid" ? ' error="Please review this value."' : ""}>\n  <${tag} id={id} variant="${variant}" placeholder="Type here…"${state === "disabled" ? " disabled" : state === "invalid" ? ' aria-invalid aria-describedby={id + "-error"}' : state === "read-only" ? ' readOnly defaultValue="Read-only content"' : ""} />\n</FormField>`,
  });
}

const options = [{ value: "design", label: "Design" }, { value: "engineering", label: "Engineering" }, { value: "archived", label: "Archived", disabled: true }];
function SelectionPreview({ state, multiple = false, selection = "none" }: { state: "enabled" | "disabled" | "empty" | "error"; multiple?: boolean; selection?: "none" | "some" | "all" }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [values, setValues] = useState<string[]>(selection === "all" ? ["design", "engineering"] : selection === "some" ? ["design"] : []);
  return multiple ? <MultiSelect label="Teams" options={state === "empty" ? [] : options} value={values} onValueChange={setValues} disabled={state === "disabled"} /> : <SelectField id={id} label="Team" options={options} value={value} onValueChange={setValue} disabled={state === "disabled"} error={state === "error" ? "Choose a team." : undefined} />;
}
function PromptPreview({ variant, status, state }: { variant: typeof appearanceStyles[number]; status: "ready" | "submitted" | "streaming" | "error"; state: "enabled" | "disabled" }) {
  const [value, setValue] = useState("");
  const [currentStatus, setStatus] = useState(status);
  return <PromptInput variant={variant} status={currentStatus} disabled={state === "disabled"} value={value} onValueChange={setValue} onSubmit={() => { setValue(""); setStatus("submitted"); }} onStop={() => setStatus("ready")} />;
}

export const inputPlaygrounds = {
  button: playground({ choices: { variant: buttonStyles, size: ["default", "sm", "lg", "icon"], shape: ["default", "pill", "square"], state: ["enabled", "disabled"] }, imports: "Button",
    render: ({ variant, size, shape, state }) => <Button variant={variant} size={size} shape={shape} disabled={state === "disabled"} aria-label={size === "icon" ? "Add item" : undefined}>{size === "icon" ? "+" : "Continue"}</Button>,
    code: ({ variant, size, shape, state }) => `<Button variant="${variant}" size="${size}" shape="${shape}"${state === "disabled" ? " disabled" : ""}${size === "icon" ? ' aria-label="Add item"' : ""}>${size === "icon" ? "+" : "Continue"}</Button>`,
  }),
  input: field(false), textarea: field(true), "form-field": field(false),
  checkbox: playground({ choices: { state: ["unchecked", "checked", "disabled"] }, imports: "Checkbox",
    render: ({ state }) => <label className="flex min-h-touch items-center gap-control"><Checkbox defaultChecked={state === "checked"} disabled={state === "disabled"} /> Email updates</label>,
    code: ({ state }) => `<label><Checkbox${state === "checked" ? " defaultChecked" : state === "disabled" ? " disabled" : ""} /> Email updates</label>`,
  }),
  switch: playground({ choices: { state: ["on", "off", "disabled"] }, imports: "Switch, Label", setup: () => "const id = useId();",
    render: ({ state }) => <label className="flex min-h-touch items-center gap-control"><Switch defaultChecked={state === "on"} disabled={state === "disabled"} /> Notifications</label>,
    code: ({ state }) => `<div><Switch id={id}${state === "on" ? " defaultChecked" : state === "disabled" ? " disabled" : ""} /><Label htmlFor={id}>Notifications</Label></div>`,
  }),
  select: playground({ choices: { state: ["enabled", "disabled", "error"] }, imports: "SelectField", setup: () => 'const id = useId();\nconst [value, setValue] = useState("");',
    render: values => <SelectionPreview {...values} />,
    code: ({ state }) => `<SelectField id={id} label="Team" value={value} onValueChange={setValue}\n  options={${JSON.stringify(options)}}${state === "disabled" ? " disabled" : state === "error" ? ' error="Choose a team."' : ""} />`,
  }),
  "multi-select": playground({ choices: { selection: ["none", "some", "all"], state: ["enabled", "disabled", "empty"] }, imports: "MultiSelect",
    setup: ({ selection }) => `const [value, setValue] = useState<string[]>(${JSON.stringify(selection === "all" ? ["design", "engineering"] : selection === "some" ? ["design"] : [])});`,
    render: values => <SelectionPreview {...values} multiple />,
    code: ({ state }) => `<MultiSelect label="Teams" value={value} onValueChange={setValue}\n  options={${JSON.stringify(state === "empty" ? [] : options)}}${state === "disabled" ? " disabled" : ""} />`,
  }),
  "radio-group": playground({ choices: { orientation: ["vertical", "horizontal"], state: ["enabled", "disabled"] }, imports: "RadioGroup, RadioGroupItem",
    render: ({ orientation, state }) => <RadioGroup orientation={orientation} disabled={state === "disabled"} defaultValue="standard" aria-label="Delivery" className={orientation === "horizontal" ? "flex flex-wrap gap-stack" : undefined}>{["standard", "express"].map(value => <label key={value} className="flex min-h-touch items-center gap-control"><RadioGroupItem value={value} />{value}</label>)}</RadioGroup>,
    code: ({ orientation, state }) => `<RadioGroup orientation="${orientation}" defaultValue="standard" aria-label="Delivery"${state === "disabled" ? " disabled" : ""}${orientation === "horizontal" ? ' className="flex flex-wrap gap-stack"' : ""}>\n  <label><RadioGroupItem value="standard" /> Standard</label>\n  <label><RadioGroupItem value="express" /> Express</label>\n</RadioGroup>`,
  }),
  slider: playground({ choices: { orientation: ["horizontal", "vertical"], mode: ["single", "range"], state: ["enabled", "disabled"] }, imports: "Slider",
    render: ({ orientation, mode, state }) => <Slider orientation={orientation} defaultValue={mode === "range" ? [25, 75] : [50]} thumbLabels={mode === "range" ? ["Minimum", "Maximum"] : ["Value"]} disabled={state === "disabled"} />,
    code: ({ orientation, mode, state }) => `<Slider orientation="${orientation}" defaultValue={${mode === "range" ? "[25, 75]" : "[50]"}}\n  thumbLabels={${mode === "range" ? '["Minimum", "Maximum"]' : '["Value"]'}}${state === "disabled" ? " disabled" : ""} />`,
  }),
  "button-group": playground({ choices: { orientation: ["horizontal", "vertical"], variant: buttonStyles }, imports: "ButtonGroup, Button",
    render: ({ orientation, variant }) => <ButtonGroup aria-label="Actions" orientation={orientation}><Button variant={variant}>Save</Button><Button variant={variant}>Preview</Button></ButtonGroup>,
    code: ({ orientation, variant }) => `<ButtonGroup aria-label="Actions" orientation="${orientation}">\n  <Button variant="${variant}">Save</Button>\n  <Button variant="${variant}">Preview</Button>\n</ButtonGroup>`,
  }),
  kbd: playground({ choices: { shortcut: ["single", "combination"] }, imports: "Kbd",
    render: ({ shortcut }) => <span>{shortcut === "combination" && <><Kbd>Shift</Kbd> + </>}<Kbd>Enter</Kbd></span>,
    code: ({ shortcut }) => `<span>${shortcut === "combination" ? "<Kbd>Shift</Kbd> + " : ""}<Kbd>Enter</Kbd></span>`,
  }),
  message: playground({ choices: { variant: ["bubble", "plain"], from: ["user", "assistant", "system"], content: ["short", "long"] }, imports: "Message, MessageContent",
    render: ({ variant, from, content }) => <Message variant={variant} from={from}><MessageContent>{content === "long" ? "This message checks how longer content wraps within the available space. ".repeat(8) : "A message in your workspace."}</MessageContent></Message>,
    code: ({ variant, from, content }) => `<Message variant="${variant}" from="${from}">\n  <MessageContent>${content === "long" ? "This message checks how longer content wraps within the available space. ".repeat(8) : "A message in your workspace."}</MessageContent>\n</Message>`,
  }),
  "prompt-input": playground({ choices: { variant: appearanceStyles, status: ["ready", "submitted", "streaming", "error"], state: ["enabled", "disabled"] }, imports: "PromptInput",
    setup: ({ status }) => `const [value, setValue] = useState("");\nconst [status, setStatus] = useState<"ready" | "submitted" | "streaming" | "error">("${status}");`,
    render: values => <PromptPreview {...values} />,
    code: ({ variant, state }) => `<PromptInput variant="${variant}" status={status}${state === "disabled" ? " disabled" : ""}\n  value={value} onValueChange={setValue}\n  onSubmit={() => { setValue(""); setStatus("submitted"); }}\n  onStop={() => setStatus("ready")} />`,
  }),
};
