# AKS CNI 与 Overlay 网络 — azure-cni -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 9
**Last updated**: 2026-04-05

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: 1) 检查节点 syslog 确认 Palo Alto 相关进程终止 Azure CNI 的日志；2) 对比 azure-vnet `[source: ado-wiki]`
2. Check: 1) 减少 Pod 数量释放 IP；2) 在同一 VNet 下创建新的 Pod Subnet（更大地址空间），然后 az aks nodepool add 指定新的 --pod-subnet-id 创 `[source: ado-wiki]`
3. Check: 1) Verify with Kusto query on RemediatorEvent/AgentPoolSnapshot tables to confirm BadKernel remediat `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-cni-overlay-azure-cni.md)
