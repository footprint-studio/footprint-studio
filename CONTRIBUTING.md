# 贡献指南

感谢参与 Footprint Studio 项目。

## 仓库

https://github.com/footprint-studio/footprint-studio

## 环境

- Node 20 LTS
- pnpm 9（`corepack enable` 自动启用）

## 流程

1. Fork 仓库，新建分支：`feat/*` `fix/*` `docs/*` `chore/*`
2. 安装依赖：`pnpm install`
3. 开发：`pnpm dev`
4. 提交前：`pnpm lint && pnpm typecheck && pnpm test`
5. 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)
6. 发起 PR，等待 CI 通过

## 提交范围（scope）

`core` `wc` `builder` `embed` `docs` `examples` `repo` `ci` `deps` `release`

## 变更集

涉及发布的变更，请执行 `pnpm changeset` 并描述变更。
