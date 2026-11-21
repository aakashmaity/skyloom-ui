# Skyloom UI

[Live documentation](https://skyloom-ui-ashy.vercel.app/) ? [GitHub](https://github.com/aakashmaity/skyloom-ui)

React components and a live design-system catalog.

- `apps/docs`: Next.js website, with the catalog at `/` and analytics at `/analytics`.
- `packages/sky-ui`: the published `skyloom-ui` npm library.
- `tests`: shared component and browser tests.

## Development

```bash
npm install
npm run dev
```

`npm run build` builds the package before the website. Run `npm run check` for TypeScript, token, and unit checks. After building, run `npm run test:browser` (requires Microsoft Edge).

## Deploy to Vercel

Import **aakashmaity/skyloom-ui** and use these settings:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root Directory | `apps/docs` |
| Include source files outside Root Directory | Enabled |
| Install Command | Configured in `apps/docs/vercel.json` |
| Build Command | Configured in `apps/docs/vercel.json` |
| Output Directory | Default (`.next`) |

The tracked Vercel configuration installs all workspace dependencies, including build tools. The docs prebuild hook builds the local UI package before Next.js. Remove old dashboard command overrides so the repository configuration is used.

No application environment variables are required. The homepage is `/`. Pushes to the production branch deploy through the connected Vercel project.

## Publish the package

From the repository root:

```bash
npm publish --workspace skyloom-ui --access public
```

Only the library is published. See the [package README](packages/sky-ui/README.md) and [guide](packages/sky-ui/GUIDE.md) for usage.
