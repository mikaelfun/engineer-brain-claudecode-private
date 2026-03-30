# Specification: Fix Strategy Recipes — FIX.md 二元→recipe 匹配

**Track ID:** fix-recipes_20260330
**Type:** Feature
**Created:** 2026-03-30
**Status:** Draft
**Issue:** ISS-165

## Summary

将 FIX 阶段从二元策略（isEnvIssue → direct / else → opus）升级为 recipe 驱动匹配，已知模式直接按 recipe 修复，未知模式 fallback 到 opus。

## Context

FIX.md 当前：fix-analyzer.sh 判断 isEnvIssue → true 则 Main Agent 处理，false 则 spawn opus。但 34 条 learnings.yaml 经验表明大量 failure 有成熟修复模式（timeout、port conflict、JWT expired、missing dep 等），不需要 opus 推理。

## Acceptance Criteria

1. FIX.md 在 fix-analyzer 之后、spawn opus 之前，新增 recipe 查询步骤
2. 查询 tests/recipes/fix/_index.md 按 failure signature 匹配
3. 匹配到 recipe → 按 recipe 步骤修复（可能 sonnet 或 Main Agent）
4. 无匹配 → fallback 到当前 opus 路径（行为不变）
5. fix-recorder.sh 记录使用了哪个 recipe（新增 `recipeUsed` 字段）
6. state-update.md Phase Retrospective 新增 recipe 演进触发检查
7. 演进触发条件：fix 成功但无 recipe 且修复步骤 >3 步 → 建议提取

## Dependencies

- ISS-164 recipe-seed_20260330（tests/recipes/fix/ 目录和种子文件必须先存在）

## Out of Scope

- 改变 fix-analyzer.sh 的分析逻辑（只改 FIX.md 的策略选择）
