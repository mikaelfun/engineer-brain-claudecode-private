# AKS 集群版本升级 — dotnet -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Applications using frameworks not compatible with 

### aks-1146: Memory saturation or OOM errors in pods after upgrading AKS to Kubernetes 1.25: ...

**Root Cause**: Applications using frameworks not compatible with cgroup v2 (Java <8u372, .NET <5.0, Node.js) cannot correctly detect memory limits under cgroup v2, leading to over-allocation.

**Solution**:
Upgrade app runtimes: Java to OpenJDK jdk8u372+/11.0.16+/15+, .NET to 5.0+. Update monitoring/security agents to cgroup v2 compatible versions. Increase pod memory limits. Temporary: revert cgroup v1 via DaemonSet.

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-memory-saturation-after-upgrade)]`

## Phase 2: Kubernetes 1.25+ uses cgroups v2 by default. Java/

### aks-082: After upgrading AKS to Kubernetes 1.25+, Java applications show 100% memory util...

**Root Cause**: Kubernetes 1.25+ uses cgroups v2 by default. Java/JDK < 11.0.16 or < 15 do not support cgroups v2 memory limits correctly, causing incorrect memory reporting and OOM. .NET 3.1 has similar cgroups v2 compatibility issues. ICM: 369500313.

**Solution**:
1) Java: upgrade to JDK 11.0.16+ or JDK 15+. 2) .NET: upgrade to .NET 6+. 3) Reference: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/aks-memory-saturation-after-upgrade. 4) GitHub: https://github.com/Azure/AKS/issues/3443

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: K8s 1.25+ uses cgroups v2 (Ubuntu 22.04) with diff

### aks-128: After AKS upgrade to K8s 1.25+, memory utilization significantly higher; pods OO...

**Root Cause**: K8s 1.25+ uses cgroups v2 (Ubuntu 22.04) with different memory accounting. Apps optimized for cgroups v1 may exceed limits. GitHub: Azure/AKS/issues/3443

**Solution**:
Increase memory limits for affected pods. Review .NET cgroups v2 compatibility. Track ICM 369500313, 373049776, 370740949

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: AKS Kubernetes 1.25+ defaults to Cgroups V2 which 

### aks-855: Application crashes or fails after AKS cluster upgrade to Kubernetes 1.25+ due t...

**Root Cause**: AKS Kubernetes 1.25+ defaults to Cgroups V2 which is not supported by older application frameworks (.NET Core 3.1, JDK <11.0.16/<15). Applications relying on Cgroups V1 behavior break under V2.

**Solution**:
1) Upgrade framework: JDK to 11.0.16+/15+, .NET to 5+. 2) For AKS <1.28: apply CGroups V1 revert daemonset 'kubectl apply -f https://raw.githubusercontent.com/Azure/AKS/master/examples/cgroups/revert-cgroup-v1.yaml' (apply per nodepool, verify with 'stat -fc %T /sys/fs/cgroup/' - 'tmpfs' means V1). 3) For AKS 1.28+: daemonset workaround no longer supported; use AzureLinux OS which supports Cgroups V1.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FCgroups%20V2)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Memory saturation or OOM errors in pods after upgrading AKS to Kubernetes 1.25: ... | Applications using frameworks not compatible with cgroup v2 ... | Upgrade app runtimes: Java to OpenJDK jdk8u372+/11.0.16+/15+... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-memory-saturation-after-upgrade) |
| 2 | After upgrading AKS to Kubernetes 1.25+, Java applications show 100% memory util... | Kubernetes 1.25+ uses cgroups v2 by default. Java/JDK < 11.0... | 1) Java: upgrade to JDK 11.0.16+ or JDK 15+. 2) .NET: upgrad... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After AKS upgrade to K8s 1.25+, memory utilization significantly higher; pods OO... | K8s 1.25+ uses cgroups v2 (Ubuntu 22.04) with different memo... | Increase memory limits for affected pods. Review .NET cgroup... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Application crashes or fails after AKS cluster upgrade to Kubernetes 1.25+ due t... | AKS Kubernetes 1.25+ defaults to Cgroups V2 which is not sup... | 1) Upgrade framework: JDK to 11.0.16+/15+, .NET to 5+. 2) Fo... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FCgroups%20V2) |
