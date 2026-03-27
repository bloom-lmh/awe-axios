# Releasing Decoraxios

[中文说明](#中文发布手册)

This repository uses Changesets plus GitHub Actions for versioning and npm publishing.

## Current publish targets

Primary packages:

- `decoraxios`
- `@decoraxios/core`
- `@decoraxios/mock`
- `@decoraxios/ioc-aop`
- `@decoraxios/all`

Compatibility packages:

- `awe-axios`
- `@decoraxios/awe-axios-core`
- `@decoraxios/awe-axios-mock`
- `@decoraxios/awe-axios-ioc-aop`
- `@decoraxios/awe-axios-all`

## Release flow

1. Add a changeset with `npm run changeset`.
2. Merge the feature PR into `master`.
3. GitHub Actions opens or updates `chore: version packages`.
4. Merge that version PR.
5. GitHub Actions publishes the packages to npm.

## Recommended GitHub settings

- Enable GitHub Actions.
- Give `GITHUB_TOKEN` read and write permissions.
- Allow GitHub Actions to create pull requests.
- Protect `master` with a ruleset.

Required protections:

- `Require a pull request before merging`
- `Require status checks to pass`
- `Require branches to be up to date before merging`
- `Require conversation resolution before merging`
- block force pushes
- block branch deletion

Required status check:

- `Verify`

Recommended merge strategy:

- feature PRs: squash merge
- release PRs: squash merge or auto-merge

## npm authentication

Preferred:

- configure npm Trusted Publishing for each published package
- point each package to this repository and `release.yml`

Fallback:

- add a repository secret named `NPM_TOKEN`

## First release checklist

1. Push the branch to GitHub.
2. Make sure Trusted Publishing or `NPM_TOKEN` is configured.
3. Merge a PR that includes a changeset.
4. Wait for `chore: version packages`.
5. Review the release PR for version bumps and lockfile updates.
6. Merge the release PR.
7. Confirm the published versions on npm.

## Maintenance checklist

- run `npm run release:check` before shipping larger publish-related changes
- keep package names in `.changeset/config.json` aligned with the real publish list
- if package names change again, update both the primary package list and compatibility package list

---

## 中文发布手册

这个仓库使用 `Changesets + GitHub Actions` 做版本管理和 npm 发布。

## 当前发版目标

主包：

- `decoraxios`
- `@decoraxios/core`
- `@decoraxios/mock`
- `@decoraxios/ioc-aop`
- `@decoraxios/all`

兼容包：

- `awe-axios`
- `@decoraxios/awe-axios-core`
- `@decoraxios/awe-axios-mock`
- `@decoraxios/awe-axios-ioc-aop`
- `@decoraxios/awe-axios-all`

## 发版流程

1. 先执行 `npm run changeset` 生成 changeset。
2. 把功能 PR 合并到 `master`。
3. GitHub Actions 会创建或更新 `chore: version packages`。
4. 合并这个版本 PR。
5. GitHub Actions 自动发布 npm 包。

## 推荐的 GitHub 配置

- 打开 GitHub Actions
- 给 `GITHUB_TOKEN` 配置读写权限
- 允许 GitHub Actions 创建 PR
- 给 `master` 配 ruleset / branch protection

建议开启的保护项：

- `Require a pull request before merging`
- `Require status checks to pass`
- `Require branches to be up to date before merging`
- `Require conversation resolution before merging`
- 禁止 force push
- 禁止删除分支

必过检查：

- `Verify`

建议的合并策略：

- 功能 PR：`squash merge`
- release PR：`squash merge` 或 `auto-merge`

## npm 认证

优先方案：

- 给每个包配置 npm Trusted Publishing
- 仓库指向当前 GitHub 仓库
- workflow 文件填 `release.yml`

兜底方案：

- 在 GitHub Secrets 里配置 `NPM_TOKEN`

## 首次发版检查清单

1. 把分支推到 GitHub
2. 确认 Trusted Publishing 或 `NPM_TOKEN` 已配置
3. 合并一个带 changeset 的 PR
4. 等待 `chore: version packages`
5. 检查版本 PR 里的版本号和 `package-lock.json`
6. 合并版本 PR
7. 去 npm 确认发布结果

## 日常维护提醒

- 涉及发布链路的大改动前，先跑 `npm run release:check`
- `.changeset/config.json` 里的包名要和真实发版列表保持一致
- 如果后面再次改名，记得同时更新主包和兼容包两套列表
