# Synthesize Log - monitor - 2026-04-07

## Mode
Full (all sources exhausted)

## Retained Entries
Total: 1209 entries retained across 50 topics

## Discarded Entries
Total: 3 entries discarded

| ID | Reason |
|----|--------|
| monitor-1206 | incomplete (no rootCause and no solution) |
| monitor-1208 | incomplete (no rootCause and no solution) |
| monitor-1209 | incomplete (no rootCause and no solution) |

## Fusion Statistics

| Topic | Type | Entries | Drafts | Kusto |
|-------|------|---------|--------|-------|
| agent-ama-dcr | fusion | 41 | 2 | 0 |
| agent-ama-linux | fusion | 19 | 50 | 0 |
| agent-ama-windows | fusion | 15 | 27 | 0 |
| agent-general | fusion | 50 | 28 | 0 |
| agent-mma-general | fusion | 22 | 50 | 0 |
| agent-mma-linux | compact | 36 | 0 | 0 |
| agent-mma-windows | compact | 25 | 0 | 0 |
| agent-vm-insights | compact | 9 | 0 | 0 |
| ai-auto-instrumentation | fusion | 61 | 9 | 0 |
| ai-availability-tests | fusion | 25 | 9 | 0 |
| ai-azure-functions | fusion | 17 | 5 | 0 |
| ai-billing-cap | compact | 5 | 0 | 0 |
| ai-by-design | compact | 8 | 0 | 0 |
| ai-connection-config | compact | 15 | 0 | 0 |
| ai-dotnet-sdk | fusion | 10 | 20 | 0 |
| ai-export | compact | 8 | 0 | 0 |
| ai-general | fusion | 66 | 31 | 0 |
| ai-iis-aspnet | fusion | 14 | 6 | 0 |
| ai-ingestion | compact | 16 | 0 | 0 |
| ai-java-sdk | fusion | 18 | 7 | 0 |
| ai-javascript-sdk | fusion | 26 | 8 | 0 |
| ai-live-metrics | fusion | 11 | 1 | 0 |
| ai-missing-telemetry | compact | 30 | 0 | 0 |
| ai-opentelemetry | fusion | 6 | 1 | 0 |
| ai-profiler-debugger | fusion | 18 | 9 | 0 |
| ai-python-sdk | fusion | 9 | 4 | 0 |
| ai-sampling-data-volume | fusion | 15 | 8 | 0 |
| ai-sdk-general | compact | 20 | 0 | 0 |
| ai-workspace-migration | fusion | 38 | 1 | 0 |
| alert-action-group | fusion | 18 | 7 | 1 |
| alert-autoscale | compact | 6 | 0 | 0 |
| alert-general | fusion | 48 | 50 | 0 |
| alert-log-query | fusion | 13 | 0 | 1 |
| alert-metric | fusion | 18 | 0 | 1 |
| by-design-limitation | compact | 36 | 0 | 0 |
| container-monitoring | fusion | 42 | 16 | 0 |
| diagnostic-settings | fusion | 42 | 19 | 1 |
| la-billing | fusion | 13 | 7 | 0 |
| la-custom-logs | fusion | 3 | 6 | 0 |
| la-general | fusion | 96 | 13 | 1 |
| la-ingestion | fusion | 50 | 22 | 0 |
| la-query | compact | 29 | 0 | 0 |
| la-retention | compact | 6 | 0 | 0 |
| la-workspace | fusion | 2 | 12 | 0 |
| managed-grafana | fusion | 12 | 7 | 0 |
| network-ampls | fusion | 32 | 21 | 0 |
| network-dns | fusion | 2 | 3 | 0 |
| network-proxy-firewall | fusion | 6 | 3 | 0 |
| other | compact | 59 | 0 | 0 |
| permissions-rbac | fusion | 20 | 9 | 0 |

# Synthesize Log — monitor — 2026-04-24

## 模式
增量（Phase 2.5 + §5 无条件执行）

## 执行内容
- topicsToRegen: 0（无 topic 需重生成 guide）
- Phase 2.5: 生成 `_index.search.jsonl`（50 条 topic 记录）
- §5: 更新 `_index.md` 为新格式（9 列表头）
- §7: 更新 `synthesizeState`

## 评分统计
| 指标 | 值 |
|------|-----|
| 总条目 | 1209 |
| 总 topic | 50 |
| Fusion topic | 35 |
| Compact topic | 15 |
| 有 workflow | 31 |
| 全局平均分 | 6.5 |
| 全局最高分 | 9.0 |

## 融合统计
| topic | 类型 | 三元组 | draft | Kusto | Workflow |
|-------|------|--------|-------|-------|----------|
| la-general | 📋 融合 | 96 | 13 | 1 | ✅ |
| ai-general | 📋 融合 | 66 | 31 | 0 | ✅ |
| ai-auto-instrumentation | 📋 融合 | 61 | 9 | 0 | ✅ |
| other | 📊 速查 | 59 | 0 | 0 | — |
| agent-general | 📋 融合 | 50 | 28 | 0 | ✅ |
| la-ingestion | 📋 融合 | 50 | 24 | 0 | ✅ |
| alert-general | 📋 融合 | 48 | 50 | 0 | ✅ |
| container-monitoring | 📋 融合 | 42 | 16 | 0 | ✅ |
| diagnostic-settings | 📋 融合 | 42 | 19 | 1 | ✅ |
| agent-ama-dcr | 📋 融合 | 41 | 2 | 0 | ✅ |
| ai-workspace-migration | 📋 融合 | 38 | 1 | 0 | — |
| agent-mma-linux | 📊 速查 | 36 | 0 | 0 | — |
| by-design-limitation | 📊 速查 | 36 | 0 | 0 | — |
| network-ampls | 📋 融合 | 32 | 21 | 0 | ✅ |
| ai-missing-telemetry | 📊 速查 | 30 | 0 | 0 | — |
| la-query | 📊 速查 | 29 | 0 | 0 | — |
| ai-javascript-sdk | 📋 融合 | 26 | 8 | 0 | — |
| agent-mma-windows | 📊 速查 | 25 | 0 | 0 | — |
| ai-availability-tests | 📋 融合 | 25 | 9 | 0 | ✅ |
| agent-mma-general | 📋 融合 | 22 | 50 | 0 | ✅ |
| ai-sdk-general | 📊 速查 | 20 | 0 | 0 | — |
| permissions-rbac | 📋 融合 | 20 | 9 | 0 | ✅ |
| agent-ama-linux | 📋 融合 | 19 | 50 | 0 | ✅ |
| ai-java-sdk | 📋 融合 | 18 | 7 | 0 | ✅ |
| ai-profiler-debugger | 📋 融合 | 18 | 9 | 0 | ✅ |
| alert-action-group | 📋 融合 | 18 | 7 | 1 | ✅ |
| alert-metric | 📋 融合 | 18 | 0 | 1 | ✅ |
| ai-azure-functions | 📋 融合 | 17 | 5 | 0 | — |
| ai-ingestion | 📊 速查 | 16 | 0 | 0 | — |
| agent-ama-windows | 📋 融合 | 15 | 27 | 0 | ✅ |
| ai-connection-config | 📊 速查 | 15 | 0 | 0 | — |
| ai-sampling-data-volume | 📋 融合 | 15 | 8 | 0 | ✅ |
| ai-iis-aspnet | 📋 融合 | 14 | 6 | 0 | ✅ |
| alert-log-query | 📋 融合 | 13 | 0 | 1 | ✅ |
| la-billing | 📋 融合 | 13 | 7 | 0 | ✅ |
| managed-grafana | 📋 融合 | 12 | 7 | 0 | ✅ |
| ai-live-metrics | 📋 融合 | 11 | 1 | 0 | — |
| ai-dotnet-sdk | 📋 融合 | 10 | 20 | 0 | ✅ |
| agent-vm-insights | 📊 速查 | 9 | 0 | 0 | — |
| ai-python-sdk | 📋 融合 | 9 | 4 | 0 | ✅ |
| ai-by-design | 📊 速查 | 8 | 0 | 0 | — |
| ai-export | 📊 速查 | 8 | 0 | 0 | — |
| ai-opentelemetry | 📋 融合 | 6 | 1 | 0 | ✅ |
| alert-autoscale | 📊 速查 | 6 | 0 | 0 | — |
| la-retention | 📊 速查 | 6 | 0 | 0 | — |
| network-proxy-firewall | 📋 融合 | 6 | 3 | 0 | ✅ |
| ai-billing-cap | 📊 速查 | 5 | 0 | 0 | — |
| la-custom-logs | 📋 融合 | 3 | 6 | 0 | ✅ |
| la-workspace | 📋 融合 | 2 | 12 | 0 | ✅ |
| network-dns | 📋 融合 | 2 | 3 | 0 | ✅ |
