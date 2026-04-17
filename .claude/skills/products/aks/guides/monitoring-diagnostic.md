# AKS 诊断与日志收集 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 2
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Fluentd monitoring container keeps getting crashed | Fluentd container gets crash with out of memory error becaus... | The next version 1.3.0 has a fix where the limits of memory ... | [B] 6.5 | [ContentIdea#167634](https://support.microsoft.com/kb/5019728) |
| 2 | AKS monitoring in Mooncake is missing features compared to global Azure. Insight... | Mooncake Azure Monitor lacks Azure Resource Graph (ARG) back... | 1) Use ContainerLog and Perf tables in Log Analytics for mon... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/monitoring-diagnostic.md)
