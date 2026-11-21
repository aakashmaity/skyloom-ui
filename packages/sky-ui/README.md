# skyloom-ui

[Live documentation](https://skyloom-ui-ashy.vercel.app/) ? [GitHub](https://github.com/aakashmaity/skyloom-ui)

Themeable React components, animated interactions, layouts, tables, and charts.

[Documentation](https://github.com/aakashmaity/skyloom-ui/blob/main/packages/sky-ui/GUIDE.md) ? [Repository](https://github.com/aakashmaity/skyloom-ui) ? [Issues](https://github.com/aakashmaity/skyloom-ui/issues)

## Install

Requires React 19, React DOM 19, and Tailwind CSS v4.

```bash
npm install skyloom-ui
```

Add to your global CSS:

```css
@import "tailwindcss";
@import "skyloom-ui/styles.css";
```

For Next.js, add `transpilePackages: ["skyloom-ui"]` to your Next config.

## Usage

```tsx
"use client";

import { Button, LoaderOne } from "skyloom-ui";

export function Example() {
  return (
    <div className="flex items-center gap-control">
      <Button variant="hover-border-gradient">Get started</Button>
      <LoaderOne label="Loading preview" />
    </div>
  );
}
```

Individual imports are also available:

```tsx
import { Button } from "skyloom-ui/components/button";
```

## Themes

Set theme and density on `html` so dialogs and popovers inherit them:

```html
<html lang="en" data-theme="dark" data-density="comfortable">
```

Themes: `light`, `dark`, `sepia`. Densities: `comfortable`, `compact`.
Use `ThemeProvider`, `ThemeScript`, and `ThemeControls` for saved preferences and system theme support.

## Components

- Buttons, fields, forms, uploads, dialogs, and navigation.
- Loaders, tooltips, link previews, and text effects.
- Tables, charts, maps, globe, and timeline.
- Bento layouts, comparison sliders, and infinite card grids.

See the [guide](https://github.com/aakashmaity/skyloom-ui/blob/main/packages/sky-ui/GUIDE.md) for APIs, motion settings, and integration examples. Uploads, authentication, and preview endpoints remain application-owned.

## Development

```bash
npm install
npm run typecheck
npm run build
```

This repository contains the reusable package. The demo catalog lives in `apps/docs` and integration tests live in `tests` in this repository.
