# AKS 节点 OS 与内核 -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: PTY (pseudo-terminal) pool exhausted on the node: 

### aks-1048: kubectl exec / docker exec fails with 'OCI runtime exec failed: exec failed: una...

**Root Cause**: PTY (pseudo-terminal) pool exhausted on the node: /proc/sys/kernel/pty/nr has reached /proc/sys/kernel/pty/max (default 4096). Caused by processes or containers creating PTY sessions without closing them (PTY leak), often from third-party containers (e.g., aqua-agent)

**Solution**:
(1) Temporarily increase PTY limit: `az vmss run-command invoke --resource-group <rg> --name <vmss> --command-id RunShellScript --instance-id <id> --scripts 'sysctl -w kernel.pty.max=8192'`. (2) Use node-shell to access the node. (3) Run `lsof > lsof.txt && ps axjf > ps.txt`. (4) Identify leaking processes: `grep -E '/ptmx|/pts/' lsof.txt | awk '{print $1, $2}' | sort | uniq -c | sort -nr`. (5) Map container IDs to pods with `crictl pods`. (6) If third-party pods are responsible, contact the vendor for a fix.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FNode%20PTY)]`

## Phase 2: Work by design. AKS pods run in isolated namespace

### aks-201: Customer modifies kernel parameters (sysctl) on AKS node VM, but changes do not ...

**Root Cause**: Work by design. AKS pods run in isolated namespaces and do not inherit all host kernel parameters. Sysctl settings on the node only apply to host-level processes, not containerized workloads, unless explicitly allowed.

**Solution**:
1) Use Kubernetes allowed-unsafe-sysctls or safe sysctls in pod security context for supported parameters. 2) For AKS, configure allowed sysctls via --custom-node-config at cluster/nodepool creation. 3) Not all kernel parameters can be changed in containers by design.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Ubuntu 24.04 updated systemd defaults set LimitNOF

### aks-1038: Pods on AKS Ubuntu 24.04 nodes crash with Too many open files errors (java.net.S...

**Root Cause**: Ubuntu 24.04 updated systemd defaults set LimitNOFILESoft=1024 for containerd. Pods inherit this low limit and workloads needing many open sockets/handles exceed it.

**Solution**:
Apply a DaemonSet to create systemd override increasing LimitNOFILE and LimitNOFILESoft for containerd, reload and restart containerd. Ref: https://github.com/VijayRod/demo/blob/master/ai/kubernetes/ubuntu-nofile-soft-limits/daemonset.yaml

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FLinux%2FContainerd%20File%20Descriptor%20Limits%20on%20Ubuntu%2024%2004%20Nodes)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | kubectl exec / docker exec fails with 'OCI runtime exec failed: exec failed: una... | PTY (pseudo-terminal) pool exhausted on the node: /proc/sys/... | (1) Temporarily increase PTY limit: `az vmss run-command inv... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FNode%20PTY) |
| 2 | Customer modifies kernel parameters (sysctl) on AKS node VM, but changes do not ... | Work by design. AKS pods run in isolated namespaces and do n... | 1) Use Kubernetes allowed-unsafe-sysctls or safe sysctls in ... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Pods on AKS Ubuntu 24.04 nodes crash with Too many open files errors (java.net.S... | Ubuntu 24.04 updated systemd defaults set LimitNOFILESoft=10... | Apply a DaemonSet to create systemd override increasing Limi... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FLinux%2FContainerd%20File%20Descriptor%20Limits%20on%20Ubuntu%2024%2004%20Nodes) |
