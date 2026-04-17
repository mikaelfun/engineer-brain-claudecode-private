# AKS 自动升级与维护窗口 -- Comprehensive Troubleshooting Guide

**Entries**: 1 | **Draft sources**: 1 | **Kusto queries**: 3
**Source drafts**: ado-wiki-b-auto-upgrade-scheduled-maintenance.md
**Kusto references**: auto-upgrade.md, maintenance-window.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS auto-upgrade has no pre-notification mechanism

### aks-152: AKS auto-upgrade triggers unexpectedly without notification; customer unclear ab...

**Root Cause**: AKS auto-upgrade has no pre-notification mechanism; once enabled and a new version is detected, upgrade begins immediately if no maintenance window is configured; auto-upgrade and planned maintenance work together only when maintenance window is explicitly set (minimum 4 hours recommended)

**Solution**:
Configure planned maintenance window (at least 4 hours) alongside auto-upgrade to control upgrade timing (docs: https://docs.azure.cn/zh-cn/aks/planned-maintenance); set node surge to 33% for production (not 100% to avoid simultaneous node disruption); auto-upgrade without scheduler means upgrade happens as soon as new version detected; use `az aks update --auto-upgrade-channel` to set channel (docs: https://docs.azure.cn/zh-cn/aks/auto-upgrade-cluster)

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS auto-upgrade triggers unexpectedly without notification; customer unclear ab... | AKS auto-upgrade has no pre-notification mechanism; once ena... | Configure planned maintenance window (at least 4 hours) alon... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
