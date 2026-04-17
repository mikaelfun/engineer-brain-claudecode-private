# AKS PV/PVC 与卷管理 — general -- Comprehensive Troubleshooting Guide

**Entries**: 18 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-crictl-ctr-operations-aks-nodes.md, onenote-aks-crud-operations-log-tracing.md
**Generated**: 2026-04-07

---

## Phase 1: Starting from K8s 1.24, automatic Secret creation 

### aks-133: After upgrading AKS to Kubernetes 1.24+, ServiceAccount token secrets are no lon...

**Root Cause**: Starting from K8s 1.24, automatic Secret creation for ServiceAccounts was removed. The legacy behavior of auto-creating kubernetes.io/service-account-token secrets is no longer supported.

**Solution**:
Manually create a Secret of type kubernetes.io/service-account-token with annotation kubernetes.io/service-account.name pointing to the SA. Or use kubectl create token <SA-name> for short-lived tokens. Ref: K8s 1.24 changelog urgent upgrade notes.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Bug in AKS 1.15.x where nodepool mode metadata was

### aks-222: AKS nodepool shows user mode in portal but is actually system mode; persists aft...

**Root Cause**: Bug in AKS 1.15.x where nodepool mode metadata was not correctly set; persists after upgrade

**Solution**:
File ICM for PG fix. Verify via label kubernetes.azure.com/mode: system. New clusters on 1.16+ not affected

`[Score: [B] 7.5 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 3: Internal AgentBaker ConfigurationVersion stored wi

### aks-573: AKS node pool creation or scaling fails with error: ConfigurationVersion 'v0.xxx...

**Root Cause**: Internal AgentBaker ConfigurationVersion stored with agent pool profile has been retired by the service. This is NOT a VM image issue. Occurs on long-lived clusters, snapshot-based pools, or clusters without recent control plane Kubernetes version upgrades. AgentBaker validates configurationVersion before evaluating node image.

**Solution**:
1) Preferred: Upgrade AKS control plane Kubernetes version to force regeneration of agent pool profiles and rebind to a supported configurationVersion. 2) Alternative: If customer won't upgrade and has at least one healthy nodepool, run 'az aks nodepool update --resource-group <rg> --cluster-name <cluster> --name <existing-pool>' to reconcile metadata. 3) If all mitigations fail, create ICM to EEE/AKS RP team for service-side reconciliation. GitHub tracking: https://github.com/Azure/AgentBaker/issues/6229

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Create/AgentBaker%20NodePool%20ConfigVersionError)]`

## Phase 4: Cannot directly resize nodepool VM SKU when epheme

### aks-608: AKS nodepool SKU resize fails with error 'OS disk of Ephemeral VM with size grea...

**Root Cause**: Cannot directly resize nodepool VM SKU when ephemeral OS disks are attached. The target SKU's cache disk size may not accommodate the current ephemeral disk size. Additionally, StatefulSets with Delete reclaim policy will lose PV data during migration.

**Solution**:
Step-by-step migration: 1) Create new nodepool with desired SKU (match AZ config). 2) Snapshot all PVs from Portal. 3) Cordon old nodepool nodes. 4) Restore PVCs from snapshots (match AZ). 5) Backup StatefulSet YAML. 6) Delete StatefulSet, PV, PVC. 7) Create new PV pointing to restored disk with matching labels. 8) Update PVC with matchLabels and StatefulSet with correct volume names. 9) Apply configs. 10) Drain and delete old nodepool.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FUpgrading%20nodepool%20SKUs%20with%20ephemeral%20disks%20and%20stateful%20storage)]`

## Phase 5: Kubelet image garbage collection fails because it 

### aks-697: AKS node reports DiskPressure condition; kubelet logs show 'failed to garbage co...

**Root Cause**: Kubelet image garbage collection fails because it cannot determine the last-used timestamp for some images; images with unknown last-used times are not garbage collected even under disk pressure

**Solution**:
Access node via SSH or kubectl debug node <node-name> -it --image=mcr.microsoft.com/cbl-mariner/base/core:2.0; chroot /host; run 'crictl rmi --prune' to manually remove unused images; verify with df -h

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FPruning%20unused%20images%20from%20nodes)]`

## Phase 6: Azure route table limit is 400 routes. In dual-sta

### aks-727: Dual-stack (IPv4/IPv6) kubenet cluster cannot scale beyond 200 nodes. Node addit...

**Root Cause**: Azure route table limit is 400 routes. In dual-stack kubenet, each node requires 2 routes (one for IPv4, one for IPv6), limiting the cluster to 200 nodes maximum

**Solution**:
This is a platform limitation. For >200 nodes with dual-stack, migrate to CNI Overlay dual-stack (no route tables). For kubenet dual-stack, stay within 200-node limit. Also note: LoadBalancer services do not support ExternalTrafficPolicy:Cluster for Mariner nodes in dual-stack

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Dual-Stack%20IPv6)]`

## Phase 7: vmssCSE (Custom Script Extension) accidentally rem

### aks-752: Newly created nodes not registering with AKS API server. ScaleUpTimedOut after ~...

**Root Cause**: vmssCSE (Custom Script Extension) accidentally removed from VMSS. Without CSE, nodes lack bootstrap components and cannot register with K8s API server. Required extensions: vmssCSE, AKSLinuxBilling, AKSLinuxExtension.

**Solution**:
Verify all 3 VMSS extensions present. If vmssCSE missing, create new agent pool and migrate workloads (new pool will have correct extensions).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server)]`

## Phase 8: Default Kubernetes pods automount API credentials.

### aks-863: Microsoft Defender for Cloud reports AKS clusters as noncompliant for policy: Ku...

**Root Cause**: Default Kubernetes pods automount API credentials. The Defender policy (enabled by default) flags pods not in excluded namespaces that have automounting enabled.

**Solution**:
Options: 1) Disable or exclude the policy. 2) Modify policy to exclude namespaces. 3) Add automountServiceAccountToken: false to pod YAML.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Defender%20reports%20automount%20credentials)]`

## Phase 9: VMSS Custom Script Extension (vmssCSE) was acciden

### aks-954: Newly created nodes fail to register with AKS API server; autoscaler scales up V...

**Root Cause**: VMSS Custom Script Extension (vmssCSE) was accidentally removed from the VMSS. Without CSE, nodes cannot bootstrap essential components and register with the Kubernetes API server.

**Solution**:
1) Verify all 3 required extensions are present on AKS VMSS: vmssCSE, AKSLinuxBilling, AKSLinuxExtension; 2) If vmssCSE is missing, create a new agent pool and migrate workloads; 3) Do not manually remove VMSS extensions from AKS-managed scale sets.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server)]`

## Phase 10: Customer configured Prometheus to scrape apiserver

### aks-993: PromQL query using apiserver metrics suddenly becomes consistently high and nois...

**Root Cause**: Customer configured Prometheus to scrape apiserver directly (not using AKS Control Plane Metrics feature). Due to load balancing, consecutive scrape requests may hit different apiserver pods. Since each pod maintains independent counters, rate() calculations between samples from different pods produce wildly incorrect values.

**Solution**:
Recommend customer switch to AKS Control Plane Metrics feature (https://learn.microsoft.com/azure/aks/control-plane-metrics-monitor) instead of scraping apiserver directly. If customer must scrape directly, use 'by (pod)' in PromQL to separate per-pod rates.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/prometheus%20distorted%20output%20when%20scraping%20apiserver)]`

## Phase 11: Memory resource limits in pod spec specified witho

### aks-1005: Pod stuck in ContainerCreating with error: 'MountVolume.SetUp failed for volume ...

**Root Cause**: Memory resource limits in pod spec specified without unit suffix (e.g., memory: '3' instead of '3Gi'). Without units, Kubernetes interprets the value as bytes rather than gigabytes, leading to extremely low memory allocation that causes disk-related mount failures.

**Solution**:
Add proper unit suffix to memory resource limits/requests in pod YAML. Change 'memory: "3"' to 'memory: "3Gi"' and 'memory: "2"' to 'memory: "2Gi"'. Redeploy pod to verify fix.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2Fno%20space%20on%20device)]`

## Phase 12: Bug in AKS RP code: disabling Authorized IP Ranges

### aks-085: AKS Authorized IP Ranges cannot be disabled via Portal or CLI; az aks update --a...

**Root Cause**: Bug in AKS RP code: disabling Authorized IP Ranges by passing empty value does not clear existing ranges. Emerging Issue 74570.

**Solution**:
Workaround: use space instead of empty string: az aks update --api-server-authorized-ip-ranges " ". Bug fix ETA was mid-June 2024. Tracking ICM: 508498564.

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 13: PV nodeAffinity rules do not match available node 

### aks-1105: Pod Pending: volume node affinity conflict

**Root Cause**: PV nodeAffinity rules do not match available node labels; zone mismatch

**Solution**:
kubectl get pv -o yaml to check affinity; kubectl get nodes --show-labels; update PV nodeAffinity or add labels to nodes

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-pod-scheduler-errors)]`

## Phase 14: Placement server pod tries to use persistent volum

### aks-1258: Dapr placement server pod unschedulable: 0/N nodes available, volume node affini...

**Root Cause**: Placement server pod tries to use persistent volume created in a different availability zone

**Solution**:
Install Dapr in multiple AZs (recommended), or limit placement service to specific AZ by creating custom StorageClass with allowedTopologies and setting dapr_placement.volumeclaims.storageClassName

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors)]`

## Phase 15: OS disk IO throttling on AKS worker node VMSS inst

### aks-016: AKS nodes intermittently go NotReady with API server timeouts, slow DNS, slow PV...

**Root Cause**: OS disk IO throttling on AKS worker node VMSS instances. Default OS disk 100-128GB gets saturated. Queue depth >=8 causes failures, >=10 triggers alerts.

**Solution**:
Diagnose: 1) Check HA report via BBM/unitconvert. 2) Check IO Queue Depth in Geneva VMPerf dashboard (>=8 = throttling). 3) Check syslog for Cannot connect to Docker daemon or GenericPLEG DeadlineExceeded. Mitigate: 1) New node pool with larger OS disk: az aks nodepool add --node-osdisk-size. 2) Use Ephemeral OS disk (best practice Mooncake). 3) Migrate workloads to new pool.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

## Phase 16: The no space left error on projected volumes (kube

### aks-080: Pods fail to mount projected volumes with error: MountVolume.SetUp failed for vo...

**Root Cause**: The no space left error on projected volumes (kube-api-access) is typically caused by inode exhaustion or tmpfs/memory-backed filesystem limits, not physical disk space. Container memory limits configured incorrectly can also contribute.

**Solution**:
1) Check inode usage on node: df -i. 2) Check tmpfs usage: df -h /var/lib/kubelet. 3) Verify container memory limits use correct Kubernetes quantity suffixes (E,P,T,G,M,k). 4) Check if /var/lib/kubelet is on a separate partition. 5) Reference: https://github.com/Icybiubiubiu/icyaks/wiki/No-Space-Left

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 17: Azure Policy add-on monitors AKS security posture.

### aks-1017: Microsoft Defender for Cloud triggers Medium severity alerts on AKS: 'Usage of h...

**Root Cause**: Azure Policy add-on monitors AKS security posture. Non-compliant pods trigger Defender alerts because their namespaces are not excluded from security policy constraints. Constraint templates audit hostNetwork, hostPort, hostPath usage against allowed lists.

**Solution**:
Check constraints: kubectl get constraint, kubectl describe constrainttemplate. Find ASC Default policy assignment in Azure Portal (Policy > Assignments). Add customer namespace to excluded namespaces for host networking/HostPath parameters. Wait 15min-24h for policy sync.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FRemediating%20Microsoft%20Defender%20alerts%20in%20AKS)]`

## Phase 18: AKS Automatic clusters enforce immutable Baseline 

### aks-853: Pod deployment in AKS Automatic cluster fails with error: 'HostPath volumes are ...

**Root Cause**: AKS Automatic clusters enforce immutable Baseline Pod Security Standards via ValidatingAdmissionPolicy that forbids HostPath volumes. These safeguards cannot be overridden - 'az aks safeguards update --excluded-ns' fails with 'RequestNotAllowedBecauseAssociatedClusterIsAutomaticCluster'.

**Solution**:
1) Use AKS Standard SKU if HostPath volumes are required. 2) Use supported volume types (emptyDir, configMap) instead of HostPath. 3) Use Azure Monitor Container Insights or Azure-native logging solutions for log collection.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FAKS%20Automatic%20Clusters%20HostPath%20Limitation%20Troubleshooting%20Guide)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After upgrading AKS to Kubernetes 1.24+, ServiceAccount token secrets are no lon... | Starting from K8s 1.24, automatic Secret creation for Servic... | Manually create a Secret of type kubernetes.io/service-accou... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS nodepool shows user mode in portal but is actually system mode; persists aft... | Bug in AKS 1.15.x where nodepool mode metadata was not corre... | File ICM for PG fix. Verify via label kubernetes.azure.com/m... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 3 | AKS node pool creation or scaling fails with error: ConfigurationVersion 'v0.xxx... | Internal AgentBaker ConfigurationVersion stored with agent p... | 1) Preferred: Upgrade AKS control plane Kubernetes version t... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Create/AgentBaker%20NodePool%20ConfigVersionError) |
| 4 | AKS nodepool SKU resize fails with error 'OS disk of Ephemeral VM with size grea... | Cannot directly resize nodepool VM SKU when ephemeral OS dis... | Step-by-step migration: 1) Create new nodepool with desired ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FUpgrading%20nodepool%20SKUs%20with%20ephemeral%20disks%20and%20stateful%20storage) |
| 5 | AKS node reports DiskPressure condition; kubelet logs show 'failed to garbage co... | Kubelet image garbage collection fails because it cannot det... | Access node via SSH or kubectl debug node <node-name> -it --... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FPruning%20unused%20images%20from%20nodes) |
| 6 | Dual-stack (IPv4/IPv6) kubenet cluster cannot scale beyond 200 nodes. Node addit... | Azure route table limit is 400 routes. In dual-stack kubenet... | This is a platform limitation. For >200 nodes with dual-stac... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Dual-Stack%20IPv6) |
| 7 | Newly created nodes not registering with AKS API server. ScaleUpTimedOut after ~... | vmssCSE (Custom Script Extension) accidentally removed from ... | Verify all 3 VMSS extensions present. If vmssCSE missing, cr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server) |
| 8 | Microsoft Defender for Cloud reports AKS clusters as noncompliant for policy: Ku... | Default Kubernetes pods automount API credentials. The Defen... | Options: 1) Disable or exclude the policy. 2) Modify policy ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Defender%20reports%20automount%20credentials) |
| 9 | Newly created nodes fail to register with AKS API server; autoscaler scales up V... | VMSS Custom Script Extension (vmssCSE) was accidentally remo... | 1) Verify all 3 required extensions are present on AKS VMSS:... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server) |
| 10 | PromQL query using apiserver metrics suddenly becomes consistently high and nois... | Customer configured Prometheus to scrape apiserver directly ... | Recommend customer switch to AKS Control Plane Metrics featu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/prometheus%20distorted%20output%20when%20scraping%20apiserver) |
| 11 | Pod stuck in ContainerCreating with error: 'MountVolume.SetUp failed for volume ... | Memory resource limits in pod spec specified without unit su... | Add proper unit suffix to memory resource limits/requests in... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2Fno%20space%20on%20device) |
| 12 | AKS Authorized IP Ranges cannot be disabled via Portal or CLI; az aks update --a... | Bug in AKS RP code: disabling Authorized IP Ranges by passin... | Workaround: use space instead of empty string: az aks update... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 13 | Pod Pending: volume node affinity conflict | PV nodeAffinity rules do not match available node labels; zo... | kubectl get pv -o yaml to check affinity; kubectl get nodes ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-pod-scheduler-errors) |
| 14 | Dapr placement server pod unschedulable: 0/N nodes available, volume node affini... | Placement server pod tries to use persistent volume created ... | Install Dapr in multiple AZs (recommended), or limit placeme... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 15 | AKS nodes intermittently go NotReady with API server timeouts, slow DNS, slow PV... | OS disk IO throttling on AKS worker node VMSS instances. Def... | Diagnose: 1) Check HA report via BBM/unitconvert. 2) Check I... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 16 | Pods fail to mount projected volumes with error: MountVolume.SetUp failed for vo... | The no space left error on projected volumes (kube-api-acces... | 1) Check inode usage on node: df -i. 2) Check tmpfs usage: d... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 17 | Microsoft Defender for Cloud triggers Medium severity alerts on AKS: 'Usage of h... | Azure Policy add-on monitors AKS security posture. Non-compl... | Check constraints: kubectl get constraint, kubectl describe ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FRemediating%20Microsoft%20Defender%20alerts%20in%20AKS) |
| 18 | Pod deployment in AKS Automatic cluster fails with error: 'HostPath volumes are ... | AKS Automatic clusters enforce immutable Baseline Pod Securi... | 1) Use AKS Standard SKU if HostPath volumes are required. 2)... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FAKS%20Automatic%20Clusters%20HostPath%20Limitation%20Troubleshooting%20Guide) |
