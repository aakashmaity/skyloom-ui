"use client";
import { useMemo, useState, type ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-css.js";
import { Button } from "./button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { cn } from "../lib/utils";
export type CodeSnippet = { id: string; code: string; language?: string; filename?: string; highlightLines?: readonly number[] };
export type CodeBlockProps = { lineNumbers?: boolean; className?: string } & ({ code: string; language?: string; filename?: string; highlightLines?: readonly number[]; tabs?: never } | { tabs: readonly CodeSnippet[]; code?: never; language?: never; filename?: never; highlightLines?: never });
function highlightedLines(code: string, language: string): ReactNode[][] {
  const lines: ReactNode[][] = [[]];
  const grammar = Prism.languages[language];
  function visit(items: (string | Prism.Token)[], classes: string[] = []) {
    for (const item of items) {
      if (typeof item !== "string") { visit(Array.isArray(item.content) ? item.content : [item.content], [...classes, "token", item.type]); continue; }
      item.split("\n").forEach((part, index) => {
        if (index) lines.push([]);
        const line = lines[lines.length - 1];
        line.push(classes.length ? <span key={line.length} className={classes.join(" ")}>{part}</span> : part);
      });
    }
  }
  visit(grammar ? Prism.tokenize(code, grammar) : [code]);
  return lines;
}
export function CodeBlock(props: CodeBlockProps) {
  const [selected, setSelected] = useState(props.tabs?.[0]?.id ?? ""), [copied, setCopied] = useState(false);
  const snippet = props.tabs ? props.tabs.find(tab => tab.id === selected) ?? props.tabs[0] : props;
  const code = snippet?.code ?? "", language = snippet?.language ?? "text";
  const rendered = useMemo(() => highlightedLines(code, language), [code, language]);
  const content = <><div className="flex items-center justify-between gap-control p-inline"><span className="truncate text-caption">{snippet?.filename ?? language}</span><Button size="sm" variant="ghost" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); } catch { setCopied(false); } }}>{copied ? "Copied" : "Copy code"}</Button></div><pre tabIndex={0} className="sky-focus max-w-full overflow-x-auto p-inline text-caption leading-body"><code>{rendered.map((line, index) => <span key={index} className={cn("block min-h-control", snippet?.highlightLines?.includes(index + 1) && "bg-secondary")}><span aria-hidden="true" className={cn("me-inline inline-block select-none text-muted-foreground", props.lineNumbers === false && "hidden")}>{index + 1}</span>{line}{"\n"}</span>)}</code></pre></>;
  const active = props.tabs?.find(tab => tab.id === selected)?.id ?? props.tabs?.[0]?.id ?? "";
  return <section className={cn("sky-code sky-advanced-surface min-w-0 overflow-hidden", props.className)} aria-label={snippet?.filename ?? "Code example"}>{props.tabs ? <Tabs value={active} onValueChange={value => { setSelected(value); setCopied(false); }}><TabsList aria-label="Code files">{props.tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id}>{tab.filename ?? tab.id}</TabsTrigger>)}</TabsList>{props.tabs.map(tab => <TabsContent key={tab.id} value={tab.id}>{tab.id === active && content}</TabsContent>)}</Tabs> : content}<span role="status" className="sr-only">{copied ? "Code copied" : ""}</span></section>;
}
