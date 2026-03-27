# Deploying Decoraxios Docs

This repository ships the documentation site as a static VitePress build.

## Build output

```bash
npm run docs:build
```

The generated site is written to:

```text
docs/.vitepress/dist
```

## Vercel

Use the GitHub repository:

- `bloom-lmh/decoraxios`

Recommended project settings:

- Framework preset: Other
- Install command: `npm install`
- Build command: `npm run docs:build`
- Output directory: `docs/.vitepress/dist`
- Node.js version: `20` or newer

The repository root contains `vercel.json`, so asset caching headers are configured automatically for built static assets.

If you enable extra Vercel HTML minification features, make sure they do not strip Vue hydration comments from generated HTML.

## 帽子云

帽子云适合直接部署同一份静态构建产物到国内访问线路。

推荐配置：

- 仓库：`bloom-lmh/decoraxios`
- 分支：`master`
- 构建命令：`npm run docs:build`
- 输出目录：`docs/.vitepress/dist`
- 部署方式：按需要选择自动部署或手动部署

如果不手动填写构建配置，帽子云可以尝试自动识别前端框架；但对 VitePress 项目，建议仍然显式填写上面的构建命令和输出目录，避免识别偏差。

如需绑定自定义域名，帽子云当前要求：

- 先申请域名证书
- 将域名 CNAME 到 `cname.maozi-dns.com`
- 在应用环境中绑定域名

## Dual-site suggestion

- International site: Vercel
- Mainland China site: 帽子云

Keep both sites built from the same `master` branch so the docs content stays identical across regions.
