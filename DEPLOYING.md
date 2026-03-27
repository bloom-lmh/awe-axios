# Deploying Decoraxios Docs

This repository publishes the documentation site as a static VitePress build.

## Build output

Use either of the following commands from the repository root:

```bash
npm run docs:build
```

```bash
node scripts/build-docs.mjs
```

The generated site is written to:

```text
docs/.vitepress/dist
```

## Vercel

Use the GitHub repository:

- `bloom-lmh/decoraxios`

Recommended project settings:

- Framework preset: `Other`
- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run docs:build`
- Output directory: `docs/.vitepress/dist`
- Node.js version: `20` or newer

The repository root contains `vercel.json`, so asset caching headers are configured automatically for the generated static files.

## Maoziyun

Maoziyun can deploy the same VitePress build for the mainland China site, but it may run npm in workspace mode for monorepos. When that happens, `npm run docs:build` is executed for every workspace package and fails because only the repository root defines that script.

Use these settings instead:

- Repository: `bloom-lmh/decoraxios`
- Branch: `master`
- Root directory: `.`
- Install command: `npm install`
- Build command: `node scripts/build-docs.mjs`
- Output directory: `docs/.vitepress/dist`

Do not set the root directory to `./docs`. The `docs` directory does not contain its own `package.json`, so Maoziyun cannot identify it as a buildable project by itself.

## Dual-site deployment

- International site: Vercel
- Mainland China site: Maoziyun

Keep both sites on the same `master` branch so the documentation content stays aligned across regions.
