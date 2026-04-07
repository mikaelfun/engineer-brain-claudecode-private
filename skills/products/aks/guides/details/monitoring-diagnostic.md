# AKS 诊断与日志收集 -- Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: blackbox-monitoring.md
**Generated**: 2026-04-07

---

## Phase 1: Fluentd container gets crash with out of memory er

### aks-1312: Fluentd monitoring container keeps getting crashed

**Root Cause**: Fluentd container gets crash with out of memory error because the version 1.2.1 has limit of 100Mi.

**Solution**:
The next version 1.3.0 has a fix where the limits of memory increased from 100Mi to 150Mi for the fluentd.

`[Score: [B] 6.5 | Source: [ContentIdea#167634](https://support.microsoft.com/kb/5019728)]`

## Phase 2: Mooncake Azure Monitor lacks Azure Resource Graph 

### aks-203: AKS monitoring in Mooncake is missing features compared to global Azure. Insight...

**Root Cause**: Mooncake Azure Monitor lacks Azure Resource Graph (ARG) backend support, which is required for the Containers tab. InsightsMetrics table is a preview feature not available in Mooncake. Feature gap between global and sovereign cloud.

**Solution**:
1) Use ContainerLog and Perf tables in Log Analytics for monitoring instead of InsightsMetrics. 2) For alerting, use log-based alerts on KubePodInventory/KubeNodeInventory tables. 3) Check Mooncake feature availability docs for latest updates.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Fluentd monitoring container keeps getting crashed | Fluentd container gets crash with out of memory error becaus... | The next version 1.3.0 has a fix where the limits of memory ... | [B] 6.5 | [ContentIdea#167634](https://support.microsoft.com/kb/5019728) |
| 2 | AKS monitoring in Mooncake is missing features compared to global Azure. Insight... | Mooncake Azure Monitor lacks Azure Resource Graph (ARG) back... | 1) Use ContainerLog and Perf tables in Log Analytics for mon... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
