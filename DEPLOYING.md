# Deploying Decoraxios Docs

This repository publishes the documentation site as a static VitePress build.

## Vercel

Use the GitHub repository:

- `bloom-lmh/decoraxios`

Recommended project settings:

- Framework preset: `Other`
- Root directory: `docs`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.vitepress/dist`
- Node.js version: `20` or newer

The `docs` directory now contains its own `package.json` and `vercel.json`, so Vercel can treat it as a standalone VitePress site.

## Maoziyun

If you still deploy to Maoziyun, keep using the repository root:

- Repository: `bloom-lmh/decoraxios`
- Branch: `master`
- Root directory: `.`
- Install command: `npm install`
- Build command: `node scripts/build-docs.mjs`
- Output directory: `docs/.vitepress/dist`

## Build output

The generated site is written to:

```text
docs/.vitepress/dist
```
