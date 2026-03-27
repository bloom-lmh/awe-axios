# Releasing Decoraxios

[中文发布说明](#中文发布说明)

This repository uses Changesets plus GitHub Actions for versioning and npm publishing.

## Publish targets

- `decoraxios`
- `@decoraxios/core`
- `@decoraxios/mock`
- `@decoraxios/ioc-aop`
- `@decoraxios/all`

## Release flow

1. Run `npm run changeset`.
2. Merge the feature PR into `master`.
3. GitHub Actions opens or updates `chore: version packages`.
4. Review and merge the version PR.
5. GitHub Actions publishes the packages to npm.

## Release checks

Run this locally before publish-related changes:

```bash
npm run release:check
```

This runs:

- build
- typecheck
- tests
- VitePress build
- package dry-run checks

## Recommended GitHub settings

- Enable GitHub Actions
- Give `GITHUB_TOKEN` read and write permissions
- Allow GitHub Actions to create pull requests
- Protect `master` with a ruleset

Recommended required checks:

- `Verify`

Recommended merge strategy:

- feature PRs: squash merge
- version PRs: squash merge or auto-merge

## npm authentication

Preferred:

- configure npm Trusted Publishing for each published package
- point each package to this repository and `release.yml`

Fallback:

- add a repository secret named `NPM_TOKEN`

## 中文发布说明

这个仓库使用 `Changesets + GitHub Actions` 做版本管理和 npm 发布。

### 当前发布包

- `decoraxios`
- `@decoraxios/core`
- `@decoraxios/mock`
- `@decoraxios/ioc-aop`
- `@decoraxios/all`

### 发布流程

1. 执行 `npm run changeset`
2. 把功能 PR 合并到 `master`
3. GitHub Actions 自动创建或更新 `chore: version packages`
4. 检查并合并版本 PR
5. GitHub Actions 自动发布 npm

### 发布前检查

本地先执行：

```bash
npm run release:check
```

它会依次校验：

- build
- typecheck
- tests
- VitePress 构建
- 包 dry-run 打包

### 推荐 GitHub 设置

- 打开 GitHub Actions
- 给 `GITHUB_TOKEN` 开启读写权限
- 允许 GitHub Actions 创建 PR
- 给 `master` 配置 ruleset / branch protection

建议必过检查：

- `Verify`

建议合并策略：

- 功能 PR 用 `squash merge`
- 版本 PR 用 `squash merge` 或 `auto-merge`

### npm 认证

优先方案：

- 给每个包配置 npm Trusted Publishing
- workflow 指向当前仓库的 `release.yml`

兜底方案：

- 在 GitHub Secrets 中配置 `NPM_TOKEN`
