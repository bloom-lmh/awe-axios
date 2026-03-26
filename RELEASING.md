# Releasing Awe Axios

[中文说明](#中文发布手册)

This repository uses Changesets plus GitHub Actions for versioning and npm publishing.

## Current status

Publishing does not start until all of the following are true:

- The local commits have been pushed to GitHub.
- The workflows in `.github/workflows` are present on the default branch.
- npm authentication is configured through Trusted Publishing or `NPM_TOKEN`.
- A changeset-backed release PR has been merged into `master`.

## Release architecture

- CI workflow: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- Release workflow: [`.github/workflows/release.yml`](./.github/workflows/release.yml)
- Versioning source: [`.changeset`](./.changeset)

The release flow is:

1. Feature PRs include a changeset file.
2. The feature PR merges into `master`.
3. The Release workflow creates or updates a version PR titled `chore: version packages`.
4. The version PR merges into `master`.
5. The Release workflow publishes the packages to npm.

## Recommended GitHub repository settings

### 1. Enable Actions and auto-merge

In GitHub repository settings:

- Enable GitHub Actions for the repository.
- Allow `GITHUB_TOKEN` to have read and write permissions.
- Enable auto-merge if you want the release PR to merge automatically after CI passes.

### 2. Prefer a branch ruleset for `master`

GitHub now prefers repository rulesets over legacy branch protection rules. If your repository still uses branch protection rules, you can apply the same settings there.

Recommended branch target:

- Branch name pattern: `master`

Recommended protections:

- Require a pull request before merging: on
- Require status checks to pass: on
- Required status check: select the CI check from the `Verify` job
- Require branches to be up to date before merging: on
- Require conversation resolution before merging: on
- Block force pushes: on
- Block branch deletion: on
- Allow bypass only for repository admins or release maintainers

Optional, depending on team size:

- Require approvals: `0` for solo maintenance, `1` for a small team
- Require code owner review: off unless you already maintain CODEOWNERS
- Merge queue: off for now, unless your repository gets a high PR volume

## Recommended merge strategy

Use these repository merge settings:

- Allow squash merge: on
- Allow merge commit: off or on, based on your preference
- Allow rebase merge: off or on, based on your preference
- Auto-delete head branches: on

Recommended policy:

- Feature PRs: prefer squash merge
- Release PRs: prefer squash merge or auto-merge after CI passes
- Do not manually edit the release PR unless you are fixing release metadata
- Do not add feature code to the release PR

## Required status checks

For branch protection, require the CI job only:

- Required check: `Verify`

Do not require the release workflow itself as a merge gate for `master`, because that workflow runs after pushes to `master` and also manages publishing.

## npm publishing authentication

Preferred option:

- Configure npm Trusted Publishing for each package:
  - `awe-axios`
  - `@awe-axios/core`
  - `@awe-axios/mock`
  - `@awe-axios/ioc-aop`
- Point each package to this repository and the workflow file `release.yml`

Fallback option:

- Add a repository secret named `NPM_TOKEN`

## First release checklist

1. Push the local branch history to GitHub.
2. Merge the current work into `master`.
3. Configure branch rules or a ruleset for `master`.
4. Configure npm Trusted Publishing or `NPM_TOKEN`.
5. Confirm the `Release` workflow appears in the Actions tab.
6. Merge a PR that includes a changeset.
7. Wait for the release PR titled `chore: version packages`.
8. Review the release PR:
   - version bumps are expected
   - `package-lock.json` is updated
   - no unexpected source changes are present
9. Merge the release PR.
10. Confirm the published versions on npm.

## Day-to-day maintainer workflow

1. Make code changes on a feature branch.
2. Run `npm run release:check` locally if the change affects publishing.
3. Add a changeset with `npm run changeset`.
4. Open and merge the feature PR into `master`.
5. Wait for the version PR from Changesets.
6. Merge the version PR after CI passes.

## Troubleshooting

### No release PR appears

Check:

- A changeset file exists in `.changeset/`.
- The workflow files are already on `master`.
- GitHub Actions is enabled.
- The repository default branch matches the Changesets base branch.

### The release PR appears but does not publish

Check:

- npm Trusted Publishing is configured correctly, or `NPM_TOKEN` exists.
- The workflow has `id-token: write` permission for Trusted Publishing.
- The version PR was merged into `master`.

### CI blocks the release PR

Check:

- The required status check is the `Verify` job only.
- The version PR does not contain unrelated file changes.

---

## 中文发布手册

这个仓库现在使用 `Changesets + GitHub Actions` 来做版本管理和 npm 发布。

## 当前状态

只有满足下面这些条件，才会开始真正发包：

- 你本地的提交已经 push 到 GitHub。
- `.github/workflows` 已经存在于默认分支。
- npm 的发布认证已经配置好，方式是 Trusted Publishing 或 `NPM_TOKEN`。
- 带 changeset 的版本 PR 已经合并到 `master`。

## 发布链路

- CI 工作流：[`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- Release 工作流：[`.github/workflows/release.yml`](./.github/workflows/release.yml)
- 版本来源：[`.changeset`](./.changeset)

整体流程是：

1. 功能 PR 带上 changeset 文件。
2. 功能 PR 合并到 `master`。
3. Release workflow 自动创建或更新一个标题为 `chore: version packages` 的版本 PR。
4. 版本 PR 合并到 `master`。
5. Release workflow 自动把包发布到 npm。

## 推荐的 GitHub 仓库设置

### 1. 先打开 Actions 和 auto-merge

在 GitHub 仓库设置里建议这样开：

- 打开 GitHub Actions
- 允许 `GITHUB_TOKEN` 具备读写权限
- 如果你想让 release PR 在 CI 通过后自动合并，就打开 auto-merge

### 2. 优先使用 `master` 的 ruleset

GitHub 现在更推荐用 repository rulesets，而不是旧式 branch protection rule。如果你的仓库还在用旧的 branch protection，也可以按同样的配置去勾。

推荐目标分支：

- 分支模式：`master`

推荐保护项：

- `Require a pull request before merging`：开启
- `Require status checks to pass`：开启
- 必选状态检查：选择 CI 里的 `Verify` 这个 job
- `Require branches to be up to date before merging`：开启
- `Require conversation resolution before merging`：开启
- 禁止 force push：开启
- 禁止删除分支：开启
- 只给仓库管理员或 release 维护者保留 bypass 权限

按团队规模选配：

- `Require approvals`：单人维护可以设 `0`，小团队建议 `1`
- `Require code owner review`：如果你还没有维护 `CODEOWNERS`，先不要开
- `Merge queue`：现在可以先不开，除非 PR 非常多

## 推荐的合并策略

仓库级 merge 设置建议：

- `Allow squash merge`：开启
- `Allow merge commit`：按你的习惯决定
- `Allow rebase merge`：按你的习惯决定
- `Auto-delete head branches`：开启

推荐策略：

- 功能 PR：优先 `squash merge`
- 版本 PR：优先 `squash merge`，或者 CI 通过后用 `auto-merge`
- 不要手动往版本 PR 里塞功能代码
- 除了修 release 元数据，不要手改版本 PR

## 分支保护里该要求哪些检查

建议只把 CI 检查设成必过项：

- 必选检查：`Verify`

不要把 release workflow 本身设成 `master` 的必过检查，因为它是在代码已经 push 到 `master` 之后才运行，而且它自己还负责发包。

## npm 发布认证怎么配

推荐方案：

- 在 npm 上给下面 4 个包分别配置 Trusted Publishing：
  - `awe-axios`
  - `@awe-axios/core`
  - `@awe-axios/mock`
  - `@awe-axios/ioc-aop`
- 仓库指向当前 GitHub 仓库
- workflow 文件名填写 `release.yml`

兜底方案：

- 在 GitHub 仓库 secrets 里加一个 `NPM_TOKEN`

## 第一次发版检查清单

1. 先把本地提交 push 到 GitHub。
2. 把当前工作合并到 `master`。
3. 给 `master` 配好 ruleset 或 branch protection。
4. 配好 npm Trusted Publishing 或 `NPM_TOKEN`。
5. 确认 Actions 页能看到 `Release` workflow。
6. 合并一个带 changeset 的 PR。
7. 等待标题为 `chore: version packages` 的版本 PR 自动出现。
8. 检查版本 PR：
   - 版本号提升是预期的
   - `package-lock.json` 已更新
   - 没有混入奇怪的源码改动
9. 合并版本 PR。
10. 去 npm 确认发布结果。

## 日常维护流程

1. 在功能分支上开发。
2. 如果改动会影响发布，先本地跑 `npm run release:check`。
3. 用 `npm run changeset` 生成版本说明。
4. 发 PR 并合并到 `master`。
5. 等 Changesets 自动生成版本 PR。
6. CI 通过后合并版本 PR。

## 常见问题

### 为什么没有自动出现 release PR

先检查：

- `.changeset/` 里确实有 changeset 文件
- workflow 文件已经在 `master` 上
- GitHub Actions 已启用
- Changesets 的 base branch 和仓库默认分支一致

### 为什么 release PR 出现了，但没有发包

先检查：

- npm Trusted Publishing 配置是否正确，或者 `NPM_TOKEN` 是否存在
- workflow 是否保留了 `id-token: write` 权限
- 版本 PR 是否真的已经合并进 `master`

### 为什么 release PR 被保护规则卡住了

先检查：

- 必选状态检查是不是只配置了 `Verify`
- 版本 PR 里有没有混入不相关的文件改动
