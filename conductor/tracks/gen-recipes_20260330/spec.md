# Specification: Test Generation Recipes — GENERATE.md 结构化

**Track ID:** gen-recipes_20260330
**Type:** Feature
**Created:** 2026-03-30
**Status:** Draft
**Issue:** ISS-166

## Summary

将 GENERATE.md 约 50 行硬编码分类规则提取为 recipe 索引，新增 scanner 类型不再需要改 GENERATE.md。

## Context

GENERATE.md 包含 spec-driven/issue-driven/design-fidelity/ux-review/performance/architecture 6 种 gap 的分类规则和模板逻辑，已复杂到难以维护。新增 scanner 必须改 GENERATE.md 本体。

## Acceptance Criteria

1. GENERATE.md 在分类逻辑前查询 tests/recipes/generation/_index.md
2. 有匹配 → 按 recipe 的模板结构生成 YAML
3. 无匹配 → fallback 到当前硬编码分类逻辑（保持向后兼容）
4. 初始 recipes 至少覆盖：issue-driven-api, issue-driven-ui, performance-test, design-fidelity-test
5. 每个 recipe 包含：匹配条件、YAML 模板结构、推荐 assertion types、常见坑
6. GENERATE.md 中的硬编码分类保留为 fallback，不删除

## Dependencies

- ISS-164 recipe-seed_20260330（tests/recipes/generation/ 目录必须先存在）
