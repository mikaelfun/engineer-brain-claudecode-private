# Specification: tests/recipes/ 目录结构 + learnings.yaml seed

**Track ID:** recipe-seed_20260330
**Type:** Feature
**Created:** 2026-03-30
**Status:** Draft
**Issue:** ISS-164

## Summary

创建 test-loop 专属的 Recipe Architecture 基础设施目录，从现有 learnings.yaml（34 条经验）提取种子 recipes。

## Context

Recipe Architecture（ISS-149 recipe-arch_20260329）定义了三层标准模式。conductor:verify 已有完整实现（verification-recipes/）。现在需要为 test-loop 建立平行实例。

learnings.yaml 已积累 34 条分类经验（env/playwright/agent/framework），本质上是 recipe 雏形，可直接提取为结构化 recipes。

## Acceptance Criteria

1. 创建 `tests/recipes/` 目录，包含 `README.md` 引用 `playbooks/guides/recipe-architecture.md`
2. 创建 `tests/recipes/fix/_index.md`，包含初始匹配规则表（从 learnings.yaml env/playwright 类提取）
3. 创建至少 3 个 fix recipe 种子文件：env-service-down.md, auth-token-expired.md, playwright-environment.md
4. 创建 `tests/recipes/scan/_index.md`，包含初始匹配规则表（空或 1 条）
5. 创建 `tests/recipes/generation/_index.md`，包含初始匹配规则表（空或 1 条）
6. 每个 _index.md 遵循 recipe-architecture.md 标准：匹配规则表 + 版本号 + 演进日志
7. 每个 recipe 遵循标准格式：匹配条件 + 前置检查 + 执行步骤 + 常见坑
8. 不修改任何 phase 文件或 executor 脚本（纯新增）

## Out of Scope

- Phase 文件中的 recipe 查询逻辑（ISS-165/166/167）
- Recipe 自动演进触发器（ISS-165/166/167）
