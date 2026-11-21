# skyloom-ui

Theme-token-based React components, layouts, data tables, and charts for React 19 and Tailwind CSS v4. Interactive components use Radix primitives for accessible behavior.

## Installation

```bash
npm install skyloom-ui
```

React and React DOM are peer dependencies and must be available in your application.

Import the package stylesheet after Tailwind in your global CSS:

```css
@import "tailwindcss";
@import "skyloom-ui/styles.css";
```

For Next.js, add the package to `transpilePackages` in `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["skyloom-ui"],
};

export default nextConfig;
```

## Quick start

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "skyloom-ui";

export function WelcomeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get started</Button>
      </CardContent>
    </Card>
  );
}
```

Set the theme and density on the document root:

```html
<html lang="en" data-theme="light" data-density="comfortable">
```

Available themes are `light`, `dark`, and `sepia`; the optional provider also supports the `system` preference. Densities are `comfortable` (default) and `compact`.

Choose a palette and appearance independently of light/dark mode. All settings belong on `html`, including when using dialogs and other portals:

```html
<html lang="en" data-theme="dark" data-palette="ocean"
  data-appearance="modern" data-density="comfortable">
```

| Setting | Values | Default |
| --- | --- | --- |
| `data-theme` | `light`, `dark`, `sepia` (resolved theme) | `light` |
| `data-palette` | `sage`, `ocean`, `violet`, `neutral` | `sage` |
| `data-appearance` | `default`, `classic`, `modern` | `default` |
| `data-density` | `comfortable`, `compact` | `comfortable` |
| `data-font` | `system`, `inter`, `editorial`, registered custom profiles | `system` |
| `data-motion` | `system`, `reduced`, `none` | `system` |

Classic uses smaller surface corners. Modern uses softer corners and removes raised shadows. Omitting the new attributes preserves the original design. Component-level variants can override appearance for individual surfaces. The catalog at `/design-system` previews and persists these settings using the optional ThemeProvider.

### Theme preferences and typography

ThemeProvider, ThemeScript, ThemeControls, and useTheme share one settings resolver. System follows live OS color-scheme changes. Explicit themes remain selected when the OS changes. Settings persist under `sky-ui-*` keys, synchronize across tabs, and fall back safely when storage is unavailable or invalid. Existing palette/appearance/density keys remain compatible.

For Next.js, place the bootstrap script in the head and the provider around your application. Pass the same `themes`, `fontProfiles`, `defaultSettings`, and `storagePrefix` to both when customizing them. ThemeScript accepts a CSP `nonce`.

```tsx
import { ThemeScript } from "skyloom-ui/components/theme-script";
import { ThemeProvider } from "skyloom-ui/components/theme-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning>
    <head><ThemeScript defaultSettings={{ theme: "system" }} /></head>
    <body><ThemeProvider defaultSettings={{ theme: "system" }}>{children}</ThemeProvider></body>
  </html>;
}
```

Render `<ThemeControls />` inside the provider, or use `useTheme()` in your own client controls. It exposes `settings`, `resolvedTheme`, `themes`, `fontProfiles`, `updateSettings(partial)`, and `resetSettings()`. The preference is recorded as `data-theme-preference`; `data-theme` always holds the resolved CSS theme. Without a provider, setting root attributes manually remains supported.

Extend the exported `themes` registry with `{ id, label, colorScheme }` entries, retaining the built-in light/dark entries for system resolution. Define the matching `:root[data-theme="your-theme"]` semantic roles in CSS after the package stylesheet. Registration supplies a label and native color scheme; it does not generate a color palette. Keep background/foreground and status pairs accessible.

Typography is independent of color and appearance. Components consume `--sky-font-body`, `--sky-font-heading`, and `--sky-font-mono` (Tailwind `font-body`, `font-heading`, `font-mono`). The legacy `--sky-font-family` remains the body fallback. System uses platform fonts; Inter uses `--sky-loaded-inter`; Editorial uses Inter for body and `--sky-loaded-serif` for headings. All profiles retain a monospace code font. Set these loader variables or override the semantic font roles to integrate other families. The package does not download fonts or depend on Next.js font loading.

The catalog self-hosts Latin variable Inter and Source Serif 4 through `next/font/local`; font assets and their OFL licenses live in `src/app/fonts`. Unsupported glyphs use platform fallbacks. Add appropriate language subsets in the consuming app when needed.

Register additional typography profiles without modifying the package. Pass the same registry to ThemeProvider and ThemeScript; ThemeControls automatically lists it and saved preferences are validated against it. IDs must be unique and nonempty. An empty registry falls back to built-in profiles.

```tsx
import { fontProfiles, type FontProfileDefinition } from "skyloom-ui";

export const appFonts: readonly FontProfileDefinition[] = [
  ...fontProfiles,
  { id: "studio", label: "Studio" },
];
// <ThemeScript fontProfiles={appFonts} />
// <ThemeProvider fontProfiles={appFonts}>...</ThemeProvider>
```

Load the desired fonts in your app and map their variables to the semantic roles:

```css
:root[data-font="studio"] {
  --sky-font-body: var(--app-body-font, var(--sky-family-system));
  --sky-font-heading: var(--app-heading-font, var(--sky-family-serif));
  --sky-font-mono: var(--app-code-font, var(--sky-family-mono));
}
```

Registry labels do not load font files. Existing System, Inter, and Editorial behavior is unchanged. In-memory settings survive parent rerenders even when browser storage is blocked; changing `storagePrefix` loads the new namespace.

### Variants and reusable compositions

The catalog now includes a Playground for every entry. Choose actual component props, compare options, narrow the preview container, reset, and copy a standalone example matching the current selection. Charts use focused synthetic fixtures in their playgrounds. Existing metric-specific demos remain in Preview.

### Shared SVG icons

`Icon` provides `chevron-down`, `chevron-up`, `chevron-right`, `arrow-up`, `arrow-down`, `arrow-left`, `check`, `close`, `grip`, and `more-horizontal`. Icons use a shared viewBox, currentColor, and the `--sky-icon` size token. SVG coordinates describe artwork; rendered dimensions come from theme tokens. Buttons, badges, tabs, menu items, and feature-card slots also normalize direct SVG children, including third-party icons. Icons stay centered and do not shrink beside wrapping text.

```tsx
import { Button, Icon } from "skyloom-ui";

<Button variant="outline"><Icon name="check" />Save changes</Button>;
<Button size="icon" aria-label="More options"><Icon name="more-horizontal" /></Button>;
<Icon name="check" aria-label="Complete" />;
```

Icons are decorative by default; label icon-only controls on the button. Use `aria-label` or `aria-labelledby` for a standalone meaningful icon. Native SVG props, refs, and `className` are forwarded. Directional navigation icons can use `rtl:rotate-180`. Disclosure arrows rotate with expanded state and honor the shared reduced-motion settings. Preview every icon and context in the catalog's Icon playground.

### Motion preferences

ThemeProvider/ThemeScript persist `motion: "system" | "reduced" | "none"` as `data-motion`. ThemeControls exposes this setting. OS reduced motion always disables package animation; Reduced and None also disable transitions and animations. System enables subtle component feedback, Radix overlay entrance, and preview transitions. Durations and distances use `--sky-duration-enter`, `--sky-duration-fast`, and `--sky-motion-distance` tokens. Dragging remains directly user-controlled. Static labels, tables, and separators do not move autonomously.

```tsx
import { InteractiveCard, CardHeader, CardTitle, Button, Suggestions, ToolStatus, TaskPlan, ShimmerText } from "skyloom-ui";

<InteractiveCard effect="spotlight" variant="modern">
  <CardHeader><CardTitle>Your workspace</CardTitle><Button>Explore</Button></CardHeader>
</InteractiveCard>;
<Suggestions items={["Summarize", "Explain"]} onSelect={setPrompt} />;
<ToolStatus title="Search documents" status="complete" defaultOpen>3 documents found.</ToolStatus>;
<TaskPlan title="Release" steps={[{ id: "review", title: "Review changes", status: "complete", description: "Changes reviewed." }]} />;
<ShimmerText active>Preparing responseâ€¦</ShimmerText>;
```

InteractiveCard supports `lift`, `spotlight`, and `none`; it preserves Card props and refs, and uses explicit child links/buttons for actions. Suggestions supports disabled state. ToolStatus supports `pending`, `running`, `complete`, and `error`, with controlled `open`/`onOpenChange` or `defaultOpen`. TaskPlan takes uniquely identified steps with optional details. ShimmerText uses a finite pulse and retains readable text. These AI-oriented components display caller-provided state and content; they do not execute tools or connect an AI provider. See the repository's `docs/advanced-ui-research.md` for references and the implementation plan.

| Component | Variants / options |
| --- | --- |
| Button | Existing variants plus `soft`, `success`, `classic`; `shape="default\|pill\|square"` |
| Card | `default`, `outline`, `soft`, `classic`, `modern`, `elevated` |
| Input, Textarea | `default`, `filled`, `classic` |
| Badge | Existing variants plus `info`, `warning`, `soft`; `shape="default\|pill"` |
| Alert | Existing variants plus `info`, `warning` |
| DialogContent | `default`, `classic`, `modern`; `size="default\|sm\|lg"`; composable DialogHeader |
| TabsList | `default`, `line`, `outline` |

`buttonVariants` and `cardVariants` are exported for composing matching surfaces. Native props, refs, and `className` overrides remain available.

```tsx
import { Button, FeatureCard, ResponsiveGrid, StatCard } from "skyloom-ui";

<ResponsiveGrid>
  <FeatureCard title="Your workspace" description="Everything in one place."
    variant="modern" action={<Button variant="soft">Explore</Button>} />
  <StatCard label="Completed requests" value="12,840" variant="classic"
    trend="Up 12% this week" tone="success" />
</ResponsiveGrid>;
```

FeatureCard composes existing Card parts; supply `icon`, `action`, or children as needed. StatCard uses a description list, with optional description and trend. Trends use explicit `default`, `success`, or `destructive` tones. ButtonGroup wraps actions with a labeled group (`aria-label`), supports horizontal or vertical layout, and wraps on small screens. Kbd renders a keyboard hint; it does not register shortcuts.

### Lightweight chat primitives

Message, MessageContent, and MessageActions compose user, assistant, or system messages. Message supports `bubble` (default) and `plain` variants. Content is ordinary React content, with whitespace preserved; Markdown parsing and streaming transport stay in the application. Add an appropriately labeled conversation region in the application, and choose live announcements to suit your streaming behavior.

```tsx
"use client";
import { useState } from "react";
import { Message, MessageContent, PromptInput } from "skyloom-ui";

export function Composer() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("Hello");
  return <>
    <Message from="user"><MessageContent>{message}</MessageContent></Message>
    <PromptInput value={value} onValueChange={setValue} variant="modern"
      onSubmit={text => { setMessage(text); setValue(""); }} />
  </>;
}
```

PromptInput is controlled: `onSubmit(text, event)` receives trimmed, nonempty text and the caller decides when to clear the draft. Enter submits, Shift+Enter inserts a newline, and IME composition does not submit. `status="submitted"` or `"streaming"` blocks sending and displays a stop button connected to `onStop`; without `onStop`, that button is disabled. `ready` and `error` allow sending. Render error details in the application. `disabled` disables the fieldset and guards submission. Use `label`, `submitLabel`, `stopLabel`, `tools`, and `textareaProps` to customize labels, controls, refs, validation, and keyboard handling. Calling `preventDefault()` in `textareaProps.onKeyDown` overrides the built-in shortcut. Tool buttons should use `type="button"` (the Button default).

These additions have no new runtime dependencies, animation engine, or AI SDK dependency. Import individual modules when you want an explicit lightweight entry point:

```tsx
import { Button } from "skyloom-ui/components/button";
import { PromptInput } from "skyloom-ui/components/prompt-input";
```

The normal stylesheet import is still required. The root export remains available for tree-shaking bundlers. No bundle-size benchmark is implied.

Design references: [shadcn theming](https://ui.shadcn.com/docs/theming) for paired semantic roles, [Aceternity Bento Grid](https://ui.aceternity.com/components/bento-grid) for composable feature tiles, and Vercel AI Elements [Message](https://elements.ai-sdk.dev/components/message) / [Prompt Input](https://elements.ai-sdk.dev/components/prompt-input) for chat composition. These are native sky-ui implementations using the existing architecture, not full API-compatible ports.

```tsx
import { Button, SelectField, MultiSelect, Card, Dialog, Sheet, ResponsiveGrid } from "skyloom-ui";
```

## Theme and tokens

The design follows [shadcn semantic CSS variables](https://ui.shadcn.com/docs/theming) and [Tailwind v4 theme aliases](https://tailwindcss.com/docs/theme). Foundation values, semantic roles, and component decisions are separated using CSS references. This uses the aliasing principle described by [DTCG](https://www.designtokens.org/tr/2025.10/format/), without maintaining a duplicate JSON token source.

- `src/tokens.css`: OKLCH palette, rem dimensions, typography, spacing, focus/border widths, radii, shadows, layers, opacity, motion, and runtime theme, font, and density roles.
- `src/styles.css`: Tailwind inline mappings, static breakpoint tokens, shared state styles, and reduced-motion rules.
- Components: semantic utilities such as `bg-card`, `text-muted-foreground`, `p-panel`, `gap-control`, `h-field`, and `rounded-control`.

No pixel literals or raw palette colors are used in authored components. Foundation dimensions are defined centrally in rem. Zero, percentage/viewport layout, grid counts, and Radix's computed positioning values remain layout behavior. Generated Tailwind CSS and dependency internals are not authored token definitions.

Apply theme and density to the document root so body portals receive the same values:

```tsx
<html lang="en" data-theme="dark" data-density="comfortable">
```

Use `light`, `dark`, or `sepia`; use `comfortable` (default) or `compact`. Existing `.dark` works when `data-theme` is absent; explicit theme attributes take precedence. Brand overrides belong after the package stylesheet; override the appropriate `--sky-brand-light` and `--sky-brand-dark` foundation values and verify contrast. Sepia uses warm surfaces with the selected light brand palette.

## Responsive behavior

| Screen | Token | Default behavior |
| --- | --- | --- |
| Mobile | Base styles | Single-column grid, full-width sheets, stacked dialog actions, touch-size controls |
| Tablet | `tablet:` / 48rem | Two-column grid, constrained dialogs/sheets, optional compact control density |
| Laptop | `laptop:` / 64rem | Three-column grid, centered max-width container |

Breakpoints are defined once in `@theme`; CSS media queries cannot resolve runtime custom properties. Use Container, Stack, and ResponsiveGrid for shared layouts. Inputs use body-size text on mobile, panels scroll within the dynamic viewport, and tabs scroll when needed. Components allow className overrides for intentional composition.

```tsx
<Container>
  <ResponsiveGrid>
    <Card><CardHeader><CardTitle>Product</CardTitle></CardHeader></Card>
  </ResponsiveGrid>
</Container>
```

## Components

- Forms: Button, Input, Textarea, Label, Checkbox, Select (composable parts), SelectField, FormField, MultiSelect, Switch.
- Surfaces: Card and parts, Badge, Alert and parts, EmptyState, Separator.
- Overlays/navigation: Dialog and parts, Sheet and parts, Tabs and parts, Accordion and parts, Tooltip and provider.
- Loading/layout: Skeleton, Spinner, Container, Stack, ResponsiveGrid.
- Data: Avatar, Table, DataTable with pagination/search/page sizes and column management, Progress, Breadcrumb, Pagination.
- Additional overlays: DropdownMenu and Popover.
- Analytics: ChartContainer, ChartTooltipContent, CartesianChart (line/area/bar), DonutChart, ScatterPlot, Heatmap. Chart height, palettes, and emphasis use theme tokens; exact values are available in HTML data tables.

### Paginated data

```tsx
import { DataTable, type DataTableColumn } from "skyloom-ui";

type Item = { id: string; name: string };
const columns: DataTableColumn<Item>[] = [
  { id: "name", header: "Name", cell: row => row.name },
];
// Client component: supply the complete dataset, not a single server page.
<DataTable data={items} columns={columns} getRowId={row => row.id}
  caption="Items" initialPageSize={10} searchText={row => row.name} />;
```

Pagination follows filtering, and page indices are clamped after data shrinks. `loading` and `error` display distinct states. This version does not claim server pagination, sorting, selection, or virtualization.

### Column layouts

DataTable includes draggable header handles and a **Manage columns** button opening a left drawer. The drawer includes every column, including hidden ones, with visibility switches, pin controls, drag handles, and move-up/down buttons. Set `columnManagement={false}` to hide these controls. Column IDs must be unique and stable. Set `enableHiding: false` or `enablePinning: false` on individual column definitions to restrict those actions; the last visible column cannot be hidden.

```tsx
import { DataTable, type DataTableColumnLayout } from "skyloom-ui";

const initialLayout: DataTableColumnLayout = {
  order: ["id", "name", "status"],
  visibility: { id: true, name: true, status: true },
  pinning: { start: ["id"], end: [] },
};

<DataTable data={items} columns={columns} getRowId={row => row.id}
  caption="Items" defaultColumnLayout={initialLayout}
  columnLayoutStorageKey="items-columns" />;
```

Use `columnLayout` with `onColumnLayoutChange` for controlled state. Otherwise `defaultColumnLayout` initializes state and **Reset columns** restores it. Persistence is opt-in via a table-specific `columnLayoutStorageKey`; controlled callers own persistence. Malformed or unsupported saved payloads fall back to `defaultColumnLayout`. Valid stored layouts are reconciled against current definitions: removed/duplicate IDs are discarded, new columns are appended, and column capabilities take precedence.

Dragging reorders within the start, unpinned, or end group. Use pin controls to move between groups. Header dragging moves visible columns while retaining hidden slots; the drawer can reorder hidden columns too. Mouse, touch, and keyboard dragging use dnd-kit; focus a grip and press Space, use arrows, then Enter to drop or Escape to cancel. Drawer arrow buttons provide an alternative. Canceling a drag keeps the drawer open; Escape outside a drag closes it and restores trigger focus. Layout changes retain filtering and pagination.

Pinned offsets use measured cell widths and logical CSS insets, supporting RTL and remeasurement after font, density, or viewport changes. When pinned widths would leave less than `--sky-table-center-min` for the center, sticky positioning pauses and horizontal scrolling remains available. Pin choices are retained and resume at wider sizes. DataTable adds dnd-kit to its module dependency graph; basic Table and individual component imports remain available for simpler views.

### Charts

```tsx
import { CartesianChart } from "skyloom-ui";

<CartesianChart title="Token usage" unit="tokens" kind="area" stacked
  data={[{ label: "Monday", input: 1200, output: 400 }]}
  series={[
    { key: "input", label: "Input", color: "chart-1" },
    { key: "output", label: "Output", color: "chart-2" },
  ]} />;
```

Use finite numeric values or null for missing observations; keep units consistent within a Cartesian chart. Supply percentages on a 0â€“100 scale. Charts include labeled series and data-table alternatives; legend buttons toggle Cartesian series. Donut values must be nonnegative. ScatterPlot currently specializes in cost/quality comparisons with a 0â€“100 quality axis. Aggregation belongs in app features, not sky-ui.

MultiSelect supports Select all, mixed state, disabled options, and empty options. Select is single-choice; option values must be unique and nonempty, with an empty current value representing no selection. FormField labels a matching child id; connect child aria-describedby to `<id>-error` and aria-invalid when rendering an error. SelectField does this automatically.

Supply DialogTitle/SheetTitle and descriptions in overlays. Label switches and icon-only buttons. Tooltips require TooltipProvider and must not hold essential information available only on hover. Button defaults to type="button"; pass type="submit" explicitly. Button asChild expects one appropriate interactive child, such as a link; native button disabled semantics do not automatically apply to links. Accordion accepts Radix single/multiple modes. Keep business logic out of these wrappers.

## Styles and exports

The package exports its components from `skyloom-ui` and provides two stylesheet entry points:

- `skyloom-ui/styles.css` includes the theme, Tailwind utility mappings, responsive tokens, and shared state styles. Import this stylesheet for normal use.
- `skyloom-ui/tokens.css` contains the design-token CSS variables when you need tokens without the full stylesheet.

The stylesheet registers package component sources for Tailwind CSS v4 class scanning. Load it in your app's global stylesheet so the component styles and utilities are included.

## Development

From the repository's `frontend` directory, install dependencies with `npm install`. Run `npm run check` to type-check the frontend, verify compiled token and responsive styles, and run component interaction tests.


## Advanced components

The package exports the following theme-aware families. The `/design-system` catalog provides previews, variant comparison, editable configuration, copyable React examples, and animation pause/replay controls.

| Family | Exports |
| --- | --- |
| Loading | `Loader`, `LoaderOne` through `LoaderFive`, `MultiStepLoader`, `ImageGenerationLoader` |
| Navigation | `FloatingNavbar`, `ResizableNavbar`, `NavbarMenu`, `Sidebar`, `FloatingDock`, `Notch`, `AnimatedTabs`, `StickyBanner` |
| Forms | `FormPanel`, `PlaceholdersAndVanishInput`, `GooeyInput`, `FileUpload` |
| Content and visualization | `Compare` / `CompareSlider`, `Timeline`, `CodeBlock`, `WorldMap`, `Globe` |
| Layout | `LayoutGrid`, `BentoGrid`, `BentoGridItem`, `ContainerCover`, `InfiniteCardGrid` |
| Previews | `AnimatedTooltip`, `LinkPreview` |
| Text | `CanvasText`, `EncryptedText`, `LayoutTextFlip`, `ColourfulText`, `SquigglyText`, `TextGenerateEffect`, `TypewriterEffect`, `FlipWords`, `TextHoverEffect`, `ContainerTextFlip`, `HeroHighlight`, `Highlight`, `TextRevealCard`, `TextFlippingBoard` |

`Button` additionally supports `variant="hover-border-gradient"`, and `Input` supports `variant="gradient"`. Appearance variants use existing semantic tokens, so theme, palette, font, and density settings remain shared with the rest of the package.

### Motion and lifecycle

`AnimationBoundary` accepts `playing` to pause its effects. `useMotionPolicy` and `useAnimationActivity` share root settings, OS reduced-motion preferences, and document visibility; activity-aware renderers also observe intersection visibility. Canvas renderers limit pixel density and work per frame. `InfiniteCardGrid` renders at most 120 recycled tiles and provides directional controls and an accessible list. `Globe` loads its Three.js renderer dynamically after browser capability and visibility checks; an SVG map is the fallback. Three.js, Motion, and Prism remain normal installed dependencies.

### Integration contracts

- `MultiStepLoader` defaults to a looping 2,000 ms sequence. Pass `activeStep` for real externally controlled progress; timed messages are illustrative rather than backend completion events. Pass `onLoadingChange` to allow modal dismissal.
- `FileUpload` selects and validates files locally. It accepts controlled `files`, `onFilesChange`, `accept`, `maxFiles`, `maxSize`, and caller-supplied progress. Upload transport belongs to the consuming application.
- `LinkPreview` defaults to caller-supplied `preview` data and makes no metadata request. `provider="custom"` uses an abortable resolver. `provider="microlink"` explicitly opts into a third-party request that receives the target URL. Responses are cached for five minutes, with at most 100 entries.
- `Compare` supports controlled `value`/`onValueChange`, drag/hover interaction, vertical/horizontal orientation, and a native keyboard slider. `CompareSlider` is the same implementation.
- `CodeBlock` accepts either `code` or `tabs`, supports line numbers and highlights, and renders tokenized text without injecting HTML.
- Gallery images and map connections are application data. Catalog SVG illustrations are local demo assets, not package assets. Replace example image paths in other applications.

The local map geometry is derived from [Natural Earth 1:110m land](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/), rounded for display. Natural Earth data is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). It is illustrative geography, not a navigation or boundary authority.

These are native Sky UI implementations inspired by the referenced interaction patterns; they do not include licensed Aceternity paid source code.

## Advanced interaction updates

The modern Compare presentation adds a curved divider, local backdrop blur, split-color edging, and bounded particles during dragging. Both orientations support this treatment; reduced motion disables it while preserving slider interaction.

Navigation transitions use `--sky-duration-enter`. Animated tooltip springs use `--sky-spring-stiffness` and `--sky-spring-damping`. Override these tokens on the document root alongside your theme settings.

### Controlled progress

```tsx
import { MultiStepLoader } from "skyloom-ui";

<MultiStepLoader
  loading={isLoading}
  onLoadingChange={setIsLoading}
  loadingStates={[{ text: "Preparing" }, { text: "Rendering" }]}
  activeStep={currentStep}
  presentation="modal"
/>;
```

Supply application state for the variables above. Omit `activeStep` for timed progress; `duration` defaults to 2000 ms and `loop` defaults to true. Setting `loop={false}` ends the message sequence with a waiting status, not a claim that the request completed.

### Image loading overlay

```tsx
import { ImageGenerationLoader } from "skyloom-ui";

<div className="relative h-chart overflow-hidden rounded-surface">
  <ImageGenerationLoader
    effect="scale-wave"
    easing="ease-in-out"
    text="Analysing"
    cellSize={3}
    gap={1}
    bandHeight={48}
  />
</div>;
```

The numeric geometry overrides are CSS-pixel measurements. Effects include `shimmer`, `wave`, `scale-wave`, and `none`; easing supports `linear` and `ease-in-out`. A readable status remains available when animation or canvas rendering is unavailable.

### Application-owned link previews

```tsx
import { LinkPreview } from "skyloom-ui";

<LinkPreview
  href="https://example.com"
  provider="custom"
  resolve={async (url, signal) => {
    const response = await fetch(
      "/api/preview?url=" + encodeURIComponent(url),
      { signal },
    );
    if (!response.ok) throw new Error("Preview unavailable");
    return response.json();
  }}
>
  Visit website
</LinkPreview>;
```

Implement the example endpoint in your application and return `{ title?, description?, image? }`. Requests start on preview intent. The resolver receives an abort signal; the component caches successful results and ignores stale responses. Use supplied `preview` metadata for local previews, or explicitly choose `provider="microlink"` for the external service.

The catalog exposes controlled/timed loading, looping, image-loader geometry/easing, and custom preview examples. Regression coverage includes IME submission, mocked Microlink requests, simultaneous comparison hydration, and responsive dragging with live reduced-motion changes.
