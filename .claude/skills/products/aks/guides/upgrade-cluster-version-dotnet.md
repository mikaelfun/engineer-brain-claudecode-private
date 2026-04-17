# AKS 集群版本升级 — dotnet -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Memory saturation or OOM errors in pods after upgrading AKS to Kubernetes 1.25: ... | Applications using frameworks not compatible with cgroup v2 ... | Upgrade app runtimes: Java to OpenJDK jdk8u372+/11.0.16+/15+... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-memory-saturation-after-upgrade) |
| 2 | After upgrading AKS to Kubernetes 1.25+, Java applications show 100% memory util... | Kubernetes 1.25+ uses cgroups v2 by default. Java/JDK < 11.0... | 1) Java: upgrade to JDK 11.0.16+ or JDK 15+. 2) .NET: upgrad... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After AKS upgrade to K8s 1.25+, memory utilization significantly higher; pods OO... | K8s 1.25+ uses cgroups v2 (Ubuntu 22.04) with different memo... | Increase memory limits for affected pods. Review .NET cgroup... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Application crashes or fails after AKS cluster upgrade to Kubernetes 1.25+ due t... | AKS Kubernetes 1.25+ defaults to Cgroups V2 which is not sup... | 1) Upgrade framework: JDK to 11.0.16+/15+, .NET to 5+. 2) Fo... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FCgroups%20V2) |

## Quick Troubleshooting Path

1. Check: Upgrade app runtimes: Java to OpenJDK jdk8u372+/11 `[source: mslearn]`
2. Check: 1) Java: upgrade to JDK 11 `[source: onenote]`
3. Check: Increase memory limits for affected pods `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-dotnet.md)
