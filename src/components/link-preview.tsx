"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Icon } from "./icon";
import { Skeleton } from "./loading";

export type LinkPreviewData = { title?: string; description?: string; image?: string };
export type PreviewResolver = (url: string, signal: AbortSignal) => Promise<LinkPreviewData>;
export type LinkPreviewProps = { href: string; children: ReactNode; className?: string } & ({ provider?: "static"; preview: LinkPreviewData; resolve?: never } | { provider: "custom"; resolve: PreviewResolver; preview?: never } | { provider: "microlink"; preview?: never; resolve?: never });
const cache = new Map<string, { data: LinkPreviewData; expires: number }>();
const resolverIds = new WeakMap<PreviewResolver, number>();
let nextResolver = 0;
const pending = new Map<string, { promise: Promise<LinkPreviewData>; controller: AbortController; subscribers: number }>();
async function microlink(url: string, signal: AbortSignal): Promise<LinkPreviewData> {
  const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true`, { signal });
  if (!response.ok) throw new Error("Preview unavailable");
  const result = await response.json();
  if (result.status !== "success") throw new Error("Preview unavailable");
  return { title: result.data?.title, description: result.data?.description, image: result.data?.screenshot?.url ?? result.data?.image?.url };
}
export function LinkPreview(props: LinkPreviewProps) {
  const [open, setOpen] = useState(false), [data, setData] = useState<LinkPreviewData | undefined>(props.preview), [error, setError] = useState(false);
  const hover = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resolver = props.provider === "custom" ? props.resolve : microlink;
  useEffect(() => () => clearTimeout(hover.current), []);
  useEffect(() => {
    setData(props.preview); setError(false);
    if (!open || !props.provider || props.provider === "static") return;
    let parsed: URL;
    try { parsed = new URL(props.href); if (!/^https?:$/.test(parsed.protocol)) throw new Error(); } catch { setError(true); return; }
    if (!resolverIds.has(resolver)) resolverIds.set(resolver, ++nextResolver);
    const key = `${resolverIds.get(resolver)}:${parsed.href}`;
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) { setData(cached.data); return; }
    let entry = pending.get(key);
    if (!entry) {
      const controller = new AbortController();
      const promise = Promise.resolve().then(() => resolver(parsed.href, controller.signal)).then(value => { if (!controller.signal.aborted) { if (cache.size >= 100) cache.delete(cache.keys().next().value!); cache.set(key, { data: value, expires: Date.now() + 300000 }); } return value; }).finally(() => { if (pending.get(key)?.controller === controller) pending.delete(key); });
      entry = { controller, promise, subscribers: 0 }; pending.set(key, entry);
    }
    entry.subscribers++;
    let current = true;
    const timeout = setTimeout(() => {
      if (!current) return;
      current = false;
      setError(true);
      // Other subscribers own their own deadline and must not be cancelled here.
      if (entry!.subscribers === 1) entry!.controller.abort();
    }, 15000);
    entry.promise.then(value => { clearTimeout(timeout); if (current) setData(value); }, () => { clearTimeout(timeout); if (current) setError(true); });
    return () => { current = false; clearTimeout(timeout); entry!.subscribers--; if (!entry!.subscribers) { entry!.controller.abort(); if (pending.get(key) === entry) pending.delete(key); } };
  }, [open, props.href, props.preview, props.provider, resolver]);
  const enter = () => { clearTimeout(hover.current); hover.current = setTimeout(() => setOpen(true), 200); };
  const leave = () => { clearTimeout(hover.current); hover.current = setTimeout(() => setOpen(false), 250); };
  return <span className={props.className}><Popover open={open} onOpenChange={setOpen}><span className="inline-flex items-center gap-control" onMouseEnter={enter} onMouseLeave={leave}><a href={props.href} className="sky-link sky-focus text-primary underline" onFocus={enter}>{props.children}</a><PopoverTrigger asChild><Button size="icon" variant="ghost" aria-label={`Preview ${props.href}`}><Icon name="search" /></Button></PopoverTrigger></span><PopoverContent onOpenAutoFocus={event => event.preventDefault()} onMouseEnter={() => clearTimeout(hover.current)} onMouseLeave={leave} aria-label="Link preview">{error ? <p role="status" className="text-label">Preview unavailable. You can still open the link.</p> : !data ? <div role="status" aria-label="Loading preview"><Skeleton className="h-preview" /></div> : <div className="grid gap-control">{data.image && <img src={data.image} alt="Website preview" className="max-h-preview w-full rounded-control object-cover" onError={event => { event.currentTarget.hidden = true; }} />}<p className="font-medium">{data.title ?? props.href}</p>{data.description && <p className="text-label text-muted-foreground">{data.description}</p>}</div>}<a href={props.href} className="sky-focus mt-stack inline-flex min-h-touch items-center text-label text-primary underline">Open link</a></PopoverContent></Popover></span>;
}
