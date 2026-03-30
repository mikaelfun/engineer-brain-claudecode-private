# Specification: Fix coverage metrics — totalTests=0 bug + 多维进度指标

**Track ID:** coverage-metrics_20260330
**Type:** Bug
**Created:** 2026-03-30
**Status:** Draft
**Issue:** ISS-163

## Summary

修复 test framework 的三套不一致 coverage 指标，统一计算语义，并设计多维进度指标体系替代单一 coverage。

## Context

当前 coverage 有 3 个互不一致的计算：
1. **health-check.sh**: `unique ever-passed testIds / registry YAML count` — 非递减，掩盖回归
2. **stats-reporter.sh**: `(passed+fixed) / totalTests` — **broken**，因为 `state.stats.totalTests=0`
3. **manifest.json**: `tested features / total features` = 95.2% — 功能覆盖，接近天花板

这导致 supervisor dashboard 展示的 coverage 数字没有意义，trend-analyzer 的 plateau 检测不准，其他 recipe 改进（ISS-165/166/167）依赖正确的指标。

## Acceptance Criteria

1. `stats-reporter.sh` 从 registry 目录动态计算 totalTests（与 health-check.sh 一致），不再依赖 `state.stats.totalTests`
2. health-check.sh 和 stats-reporter.sh 使用相同的 coverage 公式：`unique ever-passed testIds / registry count`
3. 新增 `greenRate` 指标到 round summary：`本轮 TEST pass / 本轮 TEST total`（每轮独立，不累积）
4. 新增 `fixThroughput` 指标：`verified discoveries / total discoveries`
5. 新增 `regressionRate` 指标：`本轮 regression failures / 上轮 pass count`
6. pre-flight.sh 输出新增 `metrics` 对象（含 greenRate, fixThroughput, regressionRate），保留 `coverage` 字段向后兼容
7. trend-analyzer.sh 感知新指标，不因计算公式变化触发假告警
8. dashboard-renderer.sh 展示多维指标

## Out of Scope

- manifest.json 的功能覆盖率改造（独立关注点）
- Web Dashboard UI 适配（可后续 issue）
