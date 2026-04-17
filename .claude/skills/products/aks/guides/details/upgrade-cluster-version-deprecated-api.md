# AKS 集群版本升级 — deprecated-api -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 5
**Kusto references**: api-throttling-analysis.md, auto-upgrade.md, cluster-snapshot.md, deprecated-apis.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS release 2023-10-08+ includes auto-stop feature

### aks-137: AKS cluster upgrade automatically stopped when deprecated/breaking API usage det...

**Root Cause**: AKS release 2023-10-08+ includes auto-stop feature that halts cluster upgrade when deprecated K8s API usage is detected via kube-audit logs. This prevents upgrades that would break workloads using removed APIs.

**Solution**:
Mitigate by updating workloads to use non-deprecated APIs, then resume upgrade. Docs: https://learn.microsoft.com/azure/aks/stop-cluster-upgrade-api-breaking-changes. Check deprecated API usage before upgrading.

`[Score: [G] 10.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS detects deprecated K8s API usage via kube-audi

### aks-091: AKS control plane upgrade blocked with ValidationError/UpgradeBlockedOnDeprecate...

**Root Cause**: AKS detects deprecated K8s API usage via kube-audit logs and blocks upgrade to protect cluster. CPRemediatorLogs records detected deprecated API usage in cluster-upgrade-configmap.

**Solution**:
1) Identify workloads using deprecated APIs via kube-audit logs (filter deprecated=true); 2) Migrate to newer API versions; 3) If must bypass: set enable-force-upgrade in upgradeSettings.overrideSettings (WARNING: deprecated API calls will fail after upgrade).

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: AKS fail-fast feature detects deprecated k8s API u

### aks-733: AKS cluster minor version upgrade fails with UpgradeBlockedOnDeprecatedAPIUsage:...

**Root Cause**: AKS fail-fast feature detects deprecated k8s API usage within last 1-12 hours for the target version. Applies to minor version MC upgrades, k8s >= 1.26, preview API >= 2023-01-02-preview. Detection via CCP prometheus + remediator recording in configmap

**Solution**:
Option 1: Remove deprecated API usage and wait 12 hours for records to expire. Option 2: Set upgradeSettings.overrideSettings with controlPlaneOverrides=[IgnoreKubernetesDeprecations] and until timestamp to bypass. Find usage: query kube-audit logs (AzureDiagnostics where Category == kube-audit and log_s has deprecated). Internal: CPRemediatorLogs or kubectl get configmap cluster-upgrade-configmap -n <ccpNamespace>

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Fail%20Fast%20Upgrade%20on%20Breaking%20API%20Changes)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster upgrade automatically stopped when deprecated/breaking API usage det... | AKS release 2023-10-08+ includes auto-stop feature that halt... | Mitigate by updating workloads to use non-deprecated APIs, t... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS control plane upgrade blocked with ValidationError/UpgradeBlockedOnDeprecate... | AKS detects deprecated K8s API usage via kube-audit logs and... | 1) Identify workloads using deprecated APIs via kube-audit l... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS cluster minor version upgrade fails with UpgradeBlockedOnDeprecatedAPIUsage:... | AKS fail-fast feature detects deprecated k8s API usage withi... | Option 1: Remove deprecated API usage and wait 12 hours for ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Fail%20Fast%20Upgrade%20on%20Breaking%20API%20Changes) |
