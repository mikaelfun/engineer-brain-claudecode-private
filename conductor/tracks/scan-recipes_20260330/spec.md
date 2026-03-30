# Specification: Scan Strategy Recipes — runner 上下文感知调度

**Track ID:** scan-recipes_20260330
**Type:** Feature
**Created:** 2026-03-30
**Status:** Draft
**Issue:** ISS-167

## Summary

将 runner Strategic Review 从纯频率调度（scan-strategies.yaml）升级为上下文感知调度（recipe 覆写层）。

## Context

scan-strategies.yaml 是固定频率：every_3_rounds, every_5_rounds。runner Step 2 有推理但无经验积累。每次从零推理哪些 scanner 该开，而不参考历史上什么情况下开什么 scanner 效果好。

## Acceptance Criteria

1. tests/recipes/scan/_index.md 包含上下文覆写规则（coverage plateau, regression hotspot, new issues, fix quality decline）
2. runner Step 2 先查 scan recipe → 有覆写则用 recipe → 无覆写则按 scan-strategies.yaml 频率
3. scan-strategies.yaml 保留作为默认调度层，recipe 是覆写层不是替代
4. 至少 2 个 scan recipe：plateau-breaking.md, regression-focused-scan.md
5. 演进触发：runner override 后效果好（coverage 增 / regression 减）→ 记录到 recipe

## Dependencies

- ISS-164 recipe-seed_20260330（tests/recipes/scan/ 目录必须先存在）
- ISS-163 coverage-metrics_20260330（正确的 coverage 指标，否则 plateau 检测不准）

## Note

- 此 issue 修改 test-supervisor-runner.md Step 2（Immutable Core 文件，但手动修改是允许的）
