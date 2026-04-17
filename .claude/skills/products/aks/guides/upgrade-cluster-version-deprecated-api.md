# AKS 集群版本升级 — deprecated-api -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster upgrade automatically stopped when deprecated/breaking API usage det... | AKS release 2023-10-08+ includes auto-stop feature that halt... | Mitigate by updating workloads to use non-deprecated APIs, t... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS control plane upgrade blocked with ValidationError/UpgradeBlockedOnDeprecate... | AKS detects deprecated K8s API usage via kube-audit logs and... | 1) Identify workloads using deprecated APIs via kube-audit l... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS cluster minor version upgrade fails with UpgradeBlockedOnDeprecatedAPIUsage:... | AKS fail-fast feature detects deprecated k8s API usage withi... | Option 1: Remove deprecated API usage and wait 12 hours for ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Fail%20Fast%20Upgrade%20on%20Breaking%20API%20Changes) |

## Quick Troubleshooting Path

1. Check: Mitigate by updating workloads to use non-deprecated APIs, then resume upgrade `[source: onenote]`
2. Check: 1) Identify workloads using deprecated APIs via kube-audit logs (filter deprecated=true); 2) Migrate `[source: onenote]`
3. Check: Option 1: Remove deprecated API usage and wait 12 hours for records to expire `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-deprecated-api.md)
