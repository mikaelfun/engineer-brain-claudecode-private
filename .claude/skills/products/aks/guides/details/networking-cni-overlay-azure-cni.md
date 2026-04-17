# AKS CNI 与 Overlay 网络 — azure-cni -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 17 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Upgrade-to-Azure-CNI-Cilium-Supportability.md, ado-wiki-a-agic-pod-not-healthy.md, ado-wiki-a-aks-dynamic-pod-ip-allocation.md, ado-wiki-aks-cni-dynamic-ip-cns-prometheus-monitoring.md, ado-wiki-aks-ssh-helper-pod-node-access.md, ado-wiki-b-CLI-correlationID-to-useful-correlationID.md, ado-wiki-b-azure-cni-overlay.md, ado-wiki-byo-cni-with-aks.md, ado-wiki-c-VNet-Scaling-StaticBlock.md, ado-wiki-configuring-timezone-settings-for-a-pod.md
**Generated**: 2026-04-07

---

## Phase 1: Palo Alto 安全软件（Traps 或 Cortex Agent）将 /opt/cni/bin

### aks-469: Azure CNI 网络插件被异常终止: netplugin failed with no error message: signal: killed，导致 P...

**Root Cause**: Palo Alto 安全软件（Traps 或 Cortex Agent）将 /opt/cni/bin/azure-vnet 二进制文件识别为可疑进程并终止，导致 Azure CNI 无法为 Pod 分配 IP

**Solution**:
1) 检查节点 syslog 确认 Palo Alto 相关进程终止 Azure CNI 的日志；2) 对比 azure-vnet.log 和 syslog 时间戳确认 CNI 被中断的时间窗口；3) 联系客户将 /opt/cni/bin/azure-vnet 添加到 Palo Alto 的允许程序列表；4) 永久解决方案：从节点中移除 Palo Alto 软件

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20netplugin%20failed%20with%20no%20error%20message%3A%20signal%3A%20killed)]`

## Phase 2: Pod Subnet IP 地址耗尽（subnet capacity exceeded）。Azure

### aks-500: AKS Azure CNI Dynamic IP Allocation 场景下 Pod 创建失败，报错 FailedCreatePodSandBox: no I...

**Root Cause**: Pod Subnet IP 地址耗尽（subnet capacity exceeded）。Azure CNI Dynamic IP Allocation 以批次 16 个 IP 分配给节点，当子网中可分配 IP 不足一个完整批次时，节点无法再获取新 IP，导致 Pod 无法创建。共享 Pod Subnet 的多集群/多节点池也会加速 IP 耗尽。

**Solution**:
1) 减少 Pod 数量释放 IP；2) 在同一 VNet 下创建新的 Pod Subnet（更大地址空间），然后 az aks nodepool add 指定新的 --pod-subnet-id 创建新节点池；3) 删除处于 ContainerCreating 状态的 Pod 使其重新调度到新节点池；4) 诊断工具：AppLens 'Pod Subnet Full' detector、Geneva Resource Health dashboard、ASI Support ticket insights、Kusto 查询 ControlPlaneEvents 表过滤 'subnet capacity exceeded'

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FScraping%20Azure%20CNS%20metrics%20with%20Prometheus)]`

## Phase 3: Azure CNI bug in versions prior to v1.4.43.1 is in

### aks-504: AKS pods fail to start with FailedCreatePodSandBox error: plugin type=azure-vnet...

**Root Cause**: Azure CNI bug in versions prior to v1.4.43.1 is incompatible with Linux kernel 6.2. Nodes running Ubuntu 22.04 with OS Image version older than 202308.28 are affected when kernel 6.2 is applied.

**Solution**:
1) Verify with Kusto query on RemediatorEvent/AgentPoolSnapshot tables to confirm BadKernel remediation and affected image version; 2) Reimage affected nodes to pick up fixed CNI; 3) Or upgrade to Ubuntu 22.04 OS Image version ≥ 202308.28 (includes CNI v1.4.43.1 fix); 4) If reimage only, disable auto security updates to prevent kernel 6.2 re-application; Note: OS Image ≥ 202310.09 ships kernel 6.2 by default.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FFailed%20Create%20Pod%20SandBox%20failed%20to%20setup%20network%20for%20sandbox)]`

## Phase 4: BYOCNI clusters use non-standard CNI plugins. Micr

### aks-552: AKS cluster deployed with BYOCNI (Bring Your Own CNI) - custom third-party CNI p...

**Root Cause**: BYOCNI clusters use non-standard CNI plugins. Microsoft support cannot assist with CNI-related issues in clusters deployed with BYOCNI.

**Solution**:
BYOCNI has support implications: Microsoft support will not assist with CNI-related issues. Customer must engage the third-party CNI vendor for support. Consider migrating to Azure CNI or Kubenet for full support.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F2%20-%20What%20is%20the%20Network%20deployment%20type%20used%20in%20the%20AKS%20cluster)]`

## Phase 5: Subnet CIDR has no available IP addresses for new 

### aks-1125: InsufficientSubnetSize error during AKS cluster creation, node pool scaling, or ...

**Root Cause**: Subnet CIDR has no available IP addresses for new nodes. Azure CNI requires IPs for both nodes and pods (nodes × max-pods). Kubenet and CNI Overlay require IPs for nodes only. Upgrade operations need extra buffer IPs for surge nodes.

**Solution**:
Create a new subnet with larger CIDR range. Create a new node pool on the new subnet. Drain and migrate workloads from old node pool. Delete the old node pool. Cannot resize existing subnet CIDR in-place.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/insufficientsubnetsize-error-advanced-networking)]`

## Phase 6: Azure CNI requires additional IP addresses during 

### aks-010: AKS cluster upgrade or scale-out fails due to insufficient IP addresses in the n...

**Root Cause**: Azure CNI requires additional IP addresses during upgrade (n+1 nodes) and scale-out. If the existing subnet is exhausted, new nodes cannot be provisioned.

**Solution**:
Add a new node pool with a dedicated new subnet: 1) Create new subnet in VNet (if VNet peering exists, add new address space is not supported). 2) Get subnet resource ID. 3) az aks nodepool add --vnet-subnet-id <new-subnet-id>. 4) Drain existing nodes to new pool. 5) Then proceed with upgrade/scale.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.4[AKS] W]]`

## Phase 7: Portal and CLI use different default values for ma

### aks-258: AKS portal sets Azure CNI max pods to 110 but Azure CLI defaults to 30 causing c...

**Root Cause**: Portal and CLI use different default values for maxPods with Azure CNI. Portal defaults to 110 while CLI defaults to 30 due to IP consumption per node.

**Solution**:
Explicitly set --max-pods when creating cluster. Azure CNI pre-allocates IPs per node (maxPods * nodes) so higher maxPods requires larger subnet. Plan subnet size accordingly.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 8: CNS (azure-cns daemonset) is not running properly,

### aks-1055: Pods stuck in ContainerCreating on Azure CNI VNet Scale (StaticBlock) cluster. E...

**Root Cause**: CNS (azure-cns daemonset) is not running properly, or the NodeNetworkConfiguration (NNC) CRD is not installed, or DNC-RC has not created NNC objects for the nodes.

**Solution**:
1) Check if nodenetworkconfigs.acn.azure.com CRD is installed. 2) Verify NNCs exist (1 per node) via kubectl get nnc -A. 3) If no NNCs, check DNC-RC logs in ControlPlaneEventsAll. 4) If NNCs exist, collect CNS logs from each node and send to container networking team.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/VNet%20Scaling%20%28StaticBlock%29)]`

## Phase 9: MaxPodsPerNode limit reached. Azure CNI default is

### aks-996: Pods stuck in Pending state. Scheduler error shows 'Too many pods' for nodes. Es...

**Root Cause**: MaxPodsPerNode limit reached. Azure CNI default is 30 pods/node (vs kubenet default 110). All IP addresses on the node are exhausted, preventing new pod scheduling.

**Solution**:
1) Check maxPods value via ASC Agent Pool Profile or 'az aks nodepool show'. 2) Count current pods per node with 'kubectl get po -A -o wide'. 3) If limit hit: scale out by adding nodes, enable cluster autoscaler, or create new node pool with higher maxPods value at creation time.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPods%20stuck%20in%20Pending%20due%20to%20max%20pod%20limit)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure CNI 网络插件被异常终止: netplugin failed with no error message: signal: killed，导致 P... | Palo Alto 安全软件（Traps 或 Cortex Agent）将 /opt/cni/bin/azure-vne... | 1) 检查节点 syslog 确认 Palo Alto 相关进程终止 Azure CNI 的日志；2) 对比 azure... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20netplugin%20failed%20with%20no%20error%20message%3A%20signal%3A%20killed) |
| 2 | AKS Azure CNI Dynamic IP Allocation 场景下 Pod 创建失败，报错 FailedCreatePodSandBox: no I... | Pod Subnet IP 地址耗尽（subnet capacity exceeded）。Azure CNI Dynam... | 1) 减少 Pod 数量释放 IP；2) 在同一 VNet 下创建新的 Pod Subnet（更大地址空间），然后 az... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FScraping%20Azure%20CNS%20metrics%20with%20Prometheus) |
| 3 | AKS pods fail to start with FailedCreatePodSandBox error: plugin type=azure-vnet... | Azure CNI bug in versions prior to v1.4.43.1 is incompatible... | 1) Verify with Kusto query on RemediatorEvent/AgentPoolSnaps... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FFailed%20Create%20Pod%20SandBox%20failed%20to%20setup%20network%20for%20sandbox) |
| 4 | AKS cluster deployed with BYOCNI (Bring Your Own CNI) - custom third-party CNI p... | BYOCNI clusters use non-standard CNI plugins. Microsoft supp... | BYOCNI has support implications: Microsoft support will not ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F2%20-%20What%20is%20the%20Network%20deployment%20type%20used%20in%20the%20AKS%20cluster) |
| 5 | InsufficientSubnetSize error during AKS cluster creation, node pool scaling, or ... | Subnet CIDR has no available IP addresses for new nodes. Azu... | Create a new subnet with larger CIDR range. Create a new nod... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/insufficientsubnetsize-error-advanced-networking) |
| 6 | AKS cluster upgrade or scale-out fails due to insufficient IP addresses in the n... | Azure CNI requires additional IP addresses during upgrade (n... | Add a new node pool with a dedicated new subnet: 1) Create n... | [B] 6.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.4[AKS] W] |
| 7 | AKS portal sets Azure CNI max pods to 110 but Azure CLI defaults to 30 causing c... | Portal and CLI use different default values for maxPods with... | Explicitly set --max-pods when creating cluster. Azure CNI p... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 8 | Pods stuck in ContainerCreating on Azure CNI VNet Scale (StaticBlock) cluster. E... | CNS (azure-cns daemonset) is not running properly, or the No... | 1) Check if nodenetworkconfigs.acn.azure.com CRD is installe... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/VNet%20Scaling%20%28StaticBlock%29) |
| 9 | Pods stuck in Pending state. Scheduler error shows 'Too many pods' for nodes. Es... | MaxPodsPerNode limit reached. Azure CNI default is 30 pods/n... | 1) Check maxPods value via ASC Agent Pool Profile or 'az aks... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPods%20stuck%20in%20Pending%20due%20to%20max%20pod%20limit) |
