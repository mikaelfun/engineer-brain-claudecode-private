# AKS PV/PVC 与卷管理 — daemonset -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-linking-linux-azure-kernel-ubuntu-versions.md, ado-wiki-linux-kernel-dump-crash-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: 'sysctl -w' only applies changes in-memory; withou

### aks-606: AKS node sysctl configuration changes (e.g., net.netfilter.nf_conntrack_tcp_be_l...

**Root Cause**: 'sysctl -w' only applies changes in-memory; without adding the nf_conntrack module to /etc/modules-load.d/modules.conf and creating a persistent config in /etc/sysctl.d/, changes are lost on reboot.

**Solution**:
1) Add module: 'echo nf_conntrack >> /etc/modules-load.d/modules.conf'. 2) Create persistent config: 'echo "net.netfilter.nf_conntrack_tcp_be_liberal=1" > /etc/sysctl.d/16-custom.conf'. 3) For automation, deploy a DaemonSet with privileged nsenter container that sets both module load and sysctl config persistently. 4) Verify after reboot with 'sysctl -a | grep nf_conntrack_tcp_be_liberal'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FMaking%20conntrack%20settings%20persistent%20in%20AKS%20Nodes)]`

## Phase 2: omsagent (Azure Monitor agent) DaemonSet pod faile

### aks-050: omsagent pod not running on one AKS node; DaemonSet has fewer running pods than ...

**Root Cause**: omsagent (Azure Monitor agent) DaemonSet pod failed to schedule or start on a specific node. Volume mount issue with default service account token prevented container creation.

**Solution**:
1) Delete the stuck omsagent pod — DaemonSet will auto-recreate: 'kubectl delete pod <omsagent-pod> -n kube-system'. 2) If pod re-creation still fails, SSH to the node and check kubelet logs: 'journalctl -u kubelet'. 3) If kubelet/node issues persist, upgrade the AKS cluster which reimages nodes and resolves stale state. 4) Reference: https://github.com/feiskyer/kubernetes-handbook/blob/master/en/troubleshooting/pod.md

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: AKS does not support custom VMSS images. Node OS m

### aks-280: Customer needs to customize AKS node OS/kernel parameters (e.g. net.ipv4.tcp_ret...

**Root Cause**: AKS does not support custom VMSS images. Node OS modifications are not persisted in the VMSS model template. During upgrade or certificate renewal, nodes are reimaged to the original template (factory reset), discarding all manual OS-level changes.

**Solution**:
Workaround A (cluster-wide): Deploy a DaemonSet that applies the desired OS/kernel params on every node at startup. This ensures newly added/reimaged nodes also get the config. Remove the DaemonSet to revert. Workaround B (per-pod, less impact): Add a privileged initContainer with "sysctl -w <param>=<value>" to the target pod spec, modifying kernel params only for that pod's node. Workaround B is preferred for minimal blast radius. Always test in non-prod first. Ref: AKS support policy user-customization-of-agent-nodes.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 3.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node sysctl configuration changes (e.g., net.netfilter.nf_conntrack_tcp_be_l... | 'sysctl -w' only applies changes in-memory; without adding t... | 1) Add module: 'echo nf_conntrack >> /etc/modules-load.d/mod... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FMaking%20conntrack%20settings%20persistent%20in%20AKS%20Nodes) |
| 2 | omsagent pod not running on one AKS node; DaemonSet has fewer running pods than ... | omsagent (Azure Monitor agent) DaemonSet pod failed to sched... | 1) Delete the stuck omsagent pod — DaemonSet will auto-recre... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Customer needs to customize AKS node OS/kernel parameters (e.g. net.ipv4.tcp_ret... | AKS does not support custom VMSS images. Node OS modificatio... | Workaround A (cluster-wide): Deploy a DaemonSet that applies... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
