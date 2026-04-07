# AKS VMSS CSE 与节点启动 — vmss -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: AKS nodes have no direct SSH access by default; VM

### aks-160: Need to SSH directly into AKS VMSS worker node when kubectl-node-shell or kubect...

**Root Cause**: AKS nodes have no direct SSH access by default; VMAccessForLinux extension can inject SSH public key into VMSS instances as alternative method

**Solution**:
1) Create Linux VM in same VNET. 2) ssh-keygen. 3) az vmss extension set --name VMAccessForLinux --publisher Microsoft.OSTCExtensions --version 1.4 --protected-settings with username and ssh_key. 4) az vmss update-instances --instance-ids *. 5) ssh -i id_rsa azureuser@node_ip. Cleanup: az vmss extension delete --name VMAccessForLinux

`[Score: [G] 10.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: User changed the VMSS extension at VM level, which

### aks-625: AKS cluster cannot add new nodes after user modified VMSS extensions. Node provi...

**Root Cause**: User changed the VMSS extension at VM level, which is not supported per Azure documentation. Custom VM extensions on AKS node pools can break required node components.

**Solution**:
Use AKSNodeInstaller DaemonSet to reinstall required components on affected nodes. Project: https://github.com/patnaikshekhar/AKSNodeInstaller. Note: nsenter behavior changed in Ubuntu 18.04 - update runOnHost.sh from /usr/bin/nsenter -m/proc/1/ns/mnt to /usr/bin/nsenter -n -m/proc/1/ns/mnt.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/AKS%20Cheatsheet)]`

## Phase 3: AKS nodes have no direct SSH access by default; of

### aks-036: Need to access AKS worker node shell or retrieve node logs for troubleshooting b...

**Root Cause**: AKS nodes have no direct SSH access by default; official doc method requires multiple steps; simpler alternatives exist for support engineers doing post-mortem

**Solution**:
Method 1 — kubectl node-shell: Install plugin from github.com/kvaps/kubectl-node-shell; run "az aks get-credentials"; run "kubectl node-shell <node-name>" to enter node directly. Works on VMSS-based and AvSet-based clusters. Method 2 — Disk Snapshot (for already-deleted nodes): PowerShell: Get-AzVmssVM to get managedDiskId -> New-AzSnapshotConfig+New-AzSnapshot -> New-AzDiskConfig+New-AzDisk -> create VM from disk -> SSH -> collect logs under /tmp/logsCollection: "journalctl -u kubelet", cp /var/log/azure/ auth.log messages syslog waagent.log -> tar zcvf logsCollection.tgz

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 4: Multiple possible causes: VM powered off, kubelet 

### aks-063: AKS worker node shows NotReady status with conditions MemoryPressure/DiskPressur...

**Root Cause**: Multiple possible causes: VM powered off, kubelet process crashed, OS-level issue, network disruption preventing kubelet heartbeat to API server. The node gets tainted with unreachable:NoExecute and unschedulable:NoSchedule.

**Solution**:
1) kubectl get nodes to identify NotReady nodes. 2) Confirm VM is not powered off. 3) kubectl describe node to check conditions and taints. 4) Check FrontEndQoSEvents Kusto log for recent PUT operations on the cluster. 5) Cross-reference operationID in FrontEndContextActivity/AsyncContextActivity/HcpAsyncContextActivity for errors. 6) Check if AKS remediator attempted fix: query BlackboxMonitoringActivity for unhealthy state, then RemediatorEvent for 'CustomerLinuxNodesNotReady' reason. 7) If remediator failed, try rebooting VM. 8) Last resort: delete problem node, scale in/out by 1 to get healthy replacement. 9) For RCA: collect kubelet logs via kubectl cp or download worker node disk.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.8]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to SSH directly into AKS VMSS worker node when kubectl-node-shell or kubect... | AKS nodes have no direct SSH access by default; VMAccessForL... | 1) Create Linux VM in same VNET. 2) ssh-keygen. 3) az vmss e... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster cannot add new nodes after user modified VMSS extensions. Node provi... | User changed the VMSS extension at VM level, which is not su... | Use AKSNodeInstaller DaemonSet to reinstall required compone... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/AKS%20Cheatsheet) |
| 3 | Need to access AKS worker node shell or retrieve node logs for troubleshooting b... | AKS nodes have no direct SSH access by default; official doc... | Method 1 — kubectl node-shell: Install plugin from github.co... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 4 | AKS worker node shows NotReady status with conditions MemoryPressure/DiskPressur... | Multiple possible causes: VM powered off, kubelet process cr... | 1) kubectl get nodes to identify NotReady nodes. 2) Confirm ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.8] |
