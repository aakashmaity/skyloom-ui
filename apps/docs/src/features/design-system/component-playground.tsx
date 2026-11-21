"use client";

import { useId, useState } from "react";
import { AnimationBoundary, Button, Input, Label, SelectField, Switch, cn } from "skyloom-ui";
import { titleCase, type PlaygroundDefinition } from "./playground-model";

export function ComponentPlayground({ name, definition }: { name: string; definition: PlaygroundDefinition }) {
  const id = useId();
  const [values, setValues] = useState(definition.defaults);
  const [compare, setCompare] = useState(false);
  const [compareBy, setCompareBy] = useState(definition.controls[0].key);
  const [width, setWidth] = useState("full");
  const [revision, setRevision] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [copyState, setCopyState] = useState("Copy configuration");
  const comparison = definition.controls.find(control => control.key === compareBy)!;
  function update(key: string, value: string) { setValues(current => ({ ...current, [key]: value })); setCopyState("Copy configuration"); }
  const source = definition.source(values);
  async function copy() {
    try { await navigator.clipboard.writeText(source); setCopyState("Copied"); }
    catch { setCopyState("Copy unavailable — select the code below"); }
  }
  return <section aria-label={`${name} playground`} className="grid min-w-0 gap-panel">
    <p className="text-label text-muted-foreground">Try supported options. Theme, palette, appearance, and typography follow the controls at the top of the page.</p>
    <div className="grid min-w-0 gap-stack tablet:grid-cols-3">{definition.controls.map(control => control.kind === "text" || control.kind === "number" ? <div key={control.key} className="grid gap-control"><Label htmlFor={`${id}-${control.key}`}>{control.label}</Label><Input id={`${id}-${control.key}`} type={control.kind} min={control.min} max={control.max} value={values[control.key]} onChange={event => update(control.key, event.target.value)} /></div> : control.kind === "boolean" ? <div key={control.key} className="flex items-center gap-control"><Switch id={`${id}-${control.key}`} checked={values[control.key] === "true"} onCheckedChange={value => update(control.key, String(value))} /><Label htmlFor={`${id}-${control.key}`}>{control.label}</Label></div> : <SelectField key={control.key} id={`${id}-${control.key}`} label={control.label} value={values[control.key]} onValueChange={value => update(control.key, value)} options={control.options.map(value => ({ value, label: titleCase(value) }))} />)}</div>
    <div className="flex flex-wrap items-end gap-stack">
      <Button variant="ghost" onClick={() => setPlaying(!playing)}>{playing ? "Pause animations" : "Play animations"}</Button><Button variant="ghost" onClick={() => { setRevision(value => value + 1); setPlaying(true); }}>Replay animations</Button>
      <div className="flex min-h-touch items-center gap-control"><Switch id={`${id}-compare`} checked={compare} onCheckedChange={setCompare} /><Label htmlFor={`${id}-compare`}>Compare options</Label></div>
      {compare && <SelectField id={`${id}-compare-by`} label="Compare by" value={compareBy} onValueChange={setCompareBy} options={definition.controls.map(control => ({ value: control.key, label: control.label }))} />}
      <SelectField id={`${id}-width`} label="Preview width" value={width} onValueChange={setWidth} options={[{ value: "full", label: "Full width" }, { value: "narrow", label: "Narrow container" }]} />
      <Button variant="outline" onClick={() => { setValues(definition.defaults); setPlaying(true); setCompare(false); setCompareBy(definition.controls[0].key); setWidth("full"); setRevision(current => current + 1); setCopyState("Copy configuration"); }}>Reset playground</Button>
    </div>
    <div className={cn("grid min-w-0 gap-stack", compare && "tablet:grid-cols-2")}>
      {(compare ? comparison.options : ["selected"]).map(option => {
        const selected = compare ? { ...values, [compareBy]: option } : values;
        return <section key={option} aria-label={compare ? `${comparison.label}: ${titleCase(option)}` : "Selected preview"} className="sky-border grid min-w-0 content-start gap-stack rounded-control border-border bg-background p-inline text-foreground">
          {compare && <div className="flex flex-wrap items-center justify-between gap-control"><h4 className="text-label font-semibold">{titleCase(option)}</h4><Button variant="ghost" size="sm" aria-pressed={values[compareBy] === option} onClick={() => update(compareBy, option)}>Use {titleCase(option)}</Button></div>}
          <div className={cn("min-h-preview w-full min-w-0", width === "narrow" && "mx-auto max-w-preview-wide")}>
            <div key={`${revision}-${JSON.stringify(selected)}`} className="sky-preview-enter min-w-0"><AnimationBoundary playing={playing}>{definition.render(selected)}</AnimationBoundary></div>
          </div>
        </section>;
      })}
    </div>
    {width === "narrow" && <p className="text-caption text-muted-foreground">The container is narrower; responsive breakpoints still follow your browser window.</p>}
    <details className="min-w-0 rounded-control bg-muted p-inline">
      <summary className="sky-focus cursor-pointer rounded-control text-label font-medium">Selected configuration code</summary>
      <div className="mt-stack flex flex-wrap items-center justify-between gap-control"><span className="text-caption text-muted-foreground">Standalone React example</span><Button variant="outline" size="sm" onClick={copy}>{copyState}</Button></div>
      <pre tabIndex={0} aria-label={`${name} configuration code`} className="sky-focus mt-stack max-w-full overflow-x-auto text-caption leading-body"><code>{source}</code></pre>
    </details>
    <span role="status" className="sr-only">{copyState === "Copied" ? "Configuration copied to clipboard." : ""}</span>
  </section>;
}
