"use client";

import { useState, type CSSProperties } from "react";
import { Check, Code2, Copy, Layers, Search } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, Label, ThemeControls, Separator, Tabs, TabsList, TabsTrigger, TabsContent, cn } from "skyloom-ui";
import { categories, examples as originalExamples, type Category, type Example } from "./examples";
import { ComponentPlayground } from "./component-playground";
import { playgrounds, playgroundExamples } from "./playgrounds";
const examples = [...playgroundExamples, ...originalExamples];

function ExampleCard({ example }: { example: Example }) {
  const [copyState, setCopyState] = useState("Copy code");
  const source = !example.imports ? example.code : `${example.code.includes("useState") ? 'import { useState } from "react";\n' : ""}import { ${example.imports} } from "skyloom-ui";\n\n${example.code}`;
  async function copy() {
    try { await navigator.clipboard.writeText(source); setCopyState("Copied"); }
    catch { setCopyState("Select the code to copy"); }
  }
  const [view, setView] = useState("preview");
  return <Card id={example.id} className={cn("ds-section min-w-0 overflow-hidden shadow-none", view === "playground" && "tablet:col-span-2")}>
    <div className="flex items-start justify-between gap-control p-panel">
      <div className="min-w-0"><h3 className="text-body font-semibold">{example.name}</h3><p className="mt-control text-label leading-body text-muted-foreground">{example.description}</p></div>
      {example.isNew && <Badge variant="secondary">New</Badge>}
    </div>
    <Tabs value={view} onValueChange={setView}>
      <div className="px-panel"><TabsList aria-label={`${example.name} view`} className="w-fit bg-transparent p-0">
        <TabsTrigger value="preview" className="data-[state=active]:bg-secondary">Preview</TabsTrigger>
        <TabsTrigger value="playground" className="data-[state=active]:bg-secondary">Playground</TabsTrigger>
        <TabsTrigger value="code" className="data-[state=active]:bg-secondary"><span className="flex items-center gap-control"><Code2 aria-hidden="true" className="shrink-0 size-icon" />Code</span></TabsTrigger>
      </TabsList></div>
      <TabsContent value="preview" className="m-0 p-panel"><div className="flex min-h-preview w-full items-center"><div className="w-full min-w-0"><example.Demo /></div></div></TabsContent>
      <TabsContent value="playground" className="m-0 p-panel"><ComponentPlayground name={example.name} definition={playgrounds[example.id]} /></TabsContent>
      <TabsContent value="code" className="m-0 p-panel">
        <div className="min-h-preview rounded-control bg-muted p-inline">
          <div className="mb-stack flex items-center justify-between gap-control"><span className="text-caption text-muted-foreground">Usage · TSX</span><Button size="sm" variant="ghost" onClick={copy}>{copyState === "Copied" ? <Check aria-hidden="true" className="shrink-0 size-icon" /> : <Copy aria-hidden="true" className="shrink-0 size-icon" />}<span aria-live="polite">{copyState}</span></Button></div>
          <pre tabIndex={0} aria-label={`${example.name} code`} className="sky-focus max-w-full overflow-x-auto text-caption leading-body"><code>{source}</code></pre>
        </div>
      </TabsContent>
    </Tabs>
    <div className="flex flex-wrap items-center justify-between gap-control bg-muted px-panel py-control text-caption text-muted-foreground"><span>{example.category}</span><code>skyloom-ui</code></div>
  </Card>;
}

const swatches = ["background", "foreground", "primary", "secondary", "muted", "accent", "border", "destructive", "success"];

export function DesignSystem() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All components");
  const filtered = examples.filter(example => (category === "All components" || example.category === category) && `${example.name} ${example.description} ${example.imports}`.toLowerCase().includes(query.toLowerCase().trim()));

  return <div className="min-h-dvh">
    <a href="#main" className="sky-focus sr-only focus:not-sr-only focus:block focus:p-panel">Skip to content</a>
    <header className="sticky top-0 z-10 bg-background">
      <div className="mx-auto flex min-h-header max-w-container flex-wrap items-center justify-between gap-stack px-page py-control tablet:px-page-wide">
        <a href="/" className="sky-focus flex items-center gap-inline rounded-control" aria-label="Sky UI design system"><span className="flex size-field items-center justify-center rounded-control bg-primary text-primary-foreground"><Layers aria-hidden="true" className="shrink-0 size-icon" /></span><span className="text-title font-semibold">sky<span className="text-muted-foreground"> / </span>ui</span><Badge variant="outline">0.1</Badge></a>
        <div className="flex min-w-0 flex-wrap items-center gap-control">
          <ThemeControls />
        </div>
      </div><Separator />
    </header>

    <div className="mx-auto flex max-w-container gap-page-wide px-page tablet:px-page-wide">
      <aside className="ds-sidebar sticky hidden w-sidebar shrink-0 self-start overflow-y-auto py-page-wide laptop:block">
        <nav aria-label="Design system navigation" className="grid gap-control">
          <p className="px-inline pb-control text-caption font-semibold text-muted-foreground">WORKSPACE</p>
          <a href="#overview" className="sky-focus rounded-control px-inline py-control text-label hover:bg-secondary">Overview</a>
          <a href="#tokens" className="sky-focus rounded-control px-inline py-control text-label hover:bg-secondary">Design tokens</a>
          <a href="/analytics" className="sky-focus rounded-control px-inline py-control text-label hover:bg-secondary">AI analytics dashboard</a>
          <p className="px-inline pb-control pt-panel text-caption font-semibold text-muted-foreground">COMPONENT LIBRARY</p>
          {categories.map(item => <Button key={item} variant={category === item ? "secondary" : "ghost"} className="w-full justify-between px-inline" aria-pressed={category === item} onClick={() => { setCategory(item); document.getElementById("components")?.scrollIntoView(); }}><span>{item}</span><span className="text-caption text-muted-foreground">{item === "All components" ? examples.length : examples.filter(example => example.category === item).length}</span></Button>)}
          <Separator className="my-panel" />
          <p className="px-inline text-caption leading-body text-muted-foreground">Reusable components.<br />Made to feel like your product.</p>
        </nav>
      </aside>

      <main id="main" className="min-w-0 flex-1 py-page-wide">
        <section id="overview" className="ds-section py-panel">
          <div className="mb-panel flex flex-wrap items-center gap-control"><Badge variant="secondary"><span className="size-control rounded-full bg-primary" />The Sky UI collection</Badge><span className="text-caption text-muted-foreground">Open. Composable. Yours.</span></div>
          <h1 className="ds-heading font-semibold">Good interfaces start<br className="hidden tablet:block" /> with good foundations.</h1>
          <p className="mt-panel max-w-dialog text-body leading-body text-muted-foreground">A living library of thoughtful components. Explore the details, try the interactions, and build something that feels right.</p>
          <div className="mt-panel flex flex-wrap items-center gap-stack"><Button asChild><a href="#components">Explore components</a></Button><Button variant="outline" asChild><a href="/analytics">Explore AI analytics</a></Button></div>
          <div className="mt-page-wide flex flex-wrap items-center gap-panel text-caption text-muted-foreground"><span><strong className="text-foreground">{examples.length}</strong> live examples</span><span><strong className="text-foreground">4</strong> palettes / 3 themes + system</span><span>Mobile → Tablet → Laptop</span></div>
        </section>

        <Separator className="my-page-wide" />
        <section id="components" className="ds-section">
          <div className="mb-panel flex flex-col justify-between gap-stack tablet:flex-row tablet:items-center">
            <div><h2 className="text-title font-semibold">The component library</h2><p className="mt-control text-label text-muted-foreground">Open Playground to choose variants, compare states, and copy your configuration.</p></div>
            <div className="relative w-full tablet:w-preview-wide"><Label htmlFor="component-search" className="sr-only">Search components</Label><Input id="component-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search components…" className="pe-field" /><Search aria-hidden="true" className="shrink-0 pointer-events-none absolute end-inline top-1/2 size-icon -translate-y-1/2 text-muted-foreground" /></div>
          </div>
          <div className="mb-panel flex flex-wrap gap-control laptop:hidden" aria-label="Component categories">{categories.map(item => <Button key={item} size="sm" variant={category === item ? "secondary" : "ghost"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>)}</div>
          <p role="status" className="mb-stack text-caption text-muted-foreground">{filtered.length} of {examples.length} examples{category !== "All components" ? ` · ${category}` : ""}</p>
          {filtered.length ? <div className="grid items-start gap-panel tablet:grid-cols-2">{filtered.map(example => <ExampleCard key={example.id} example={example} />)}</div> : <Card><EmptyState title="No matching components" description="Try another name or explore a different category." action={<Button variant="outline" onClick={() => { setQuery(""); setCategory("All components"); }}>Clear filters</Button>} /></Card>}
        </section>

        <section id="tokens" className="ds-section mt-page-wide py-panel">
          <div className="mb-panel"><Badge variant="outline">Foundations</Badge><h2 className="mt-stack text-title font-semibold">One language. Every component.</h2><p className="mt-control text-label leading-body text-muted-foreground">Semantic tokens keep the details consistent. Switch themes above to see these roles adapt.</p></div>
          <div className="grid grid-cols-2 gap-stack tablet:grid-cols-3">{swatches.map(token => <Card key={token} className="overflow-hidden shadow-none"><div className="ds-swatch h-header" style={{ "--swatch": `var(--${token})` } as CSSProperties} /><div className="p-inline"><p className="text-label font-medium">{token}</p><code className="text-caption text-muted-foreground">--{token}</code></div></Card>)}</div>
          <div className="mt-panel grid gap-panel tablet:grid-cols-2"><Card className="p-panel shadow-none"><h3 className="font-semibold">Spacing & density</h3><p className="mt-control text-label leading-body text-muted-foreground">Controls, panels, and page layouts share semantic spacing. Comfortable by default, compact when you need it.</p><div className="mt-stack flex items-end gap-control" aria-label="Token spacing scale">{["h-control", "h-inline", "h-panel", "h-page-wide", "h-field-lg"].map(size => <span key={size} className={cn("w-inline rounded-control bg-primary", size)} />)}</div></Card><Card className="p-panel shadow-none"><h3 className="font-semibold">Built to fit</h3><p className="mt-control text-label leading-body text-muted-foreground">Mobile-first layouts grow at the tablet and laptop breakpoints. Touch targets stay usable, even with compact density.</p><div className="mt-stack flex flex-wrap gap-control"><Badge variant="secondary">Base · mobile</Badge><Badge variant="secondary">tablet · 48rem</Badge><Badge variant="secondary">laptop · 64rem</Badge></div></Card></div>
        </section>
        <footer className="mt-panel flex flex-wrap items-center justify-between gap-stack py-panel text-caption text-muted-foreground"><span>Sky UI · A foundation for everyday interfaces.</span><a className="sky-focus hover:text-foreground" href="https://github.com/aakashmaity/skyloom-ui" target="_blank" rel="noreferrer">GitHub</a></footer>
      </main>
    </div>
  </div>;
}
