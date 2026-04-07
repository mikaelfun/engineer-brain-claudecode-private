# AKS 自动升级与维护窗口 -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 1
**Last updated**: 2021-09-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS auto-upgrade triggers unexpectedly without notification; customer unclear ab... | AKS auto-upgrade has no pre-notification mechanism; once ena... | Configure planned maintenance window (at least 4 hours) alon... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-auto-maintenance.md)
