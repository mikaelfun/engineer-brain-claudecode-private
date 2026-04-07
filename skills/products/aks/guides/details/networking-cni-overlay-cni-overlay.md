# AKS CNI 与 Overlay 网络 — cni-overlay -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-NAP-FAQs.md, ado-wiki-b-Node-Autoprovision-Karpenter.md
**Generated**: 2026-04-07

---

## Phase 1: AKS 在 MC_ 资源组中查找 virtual network 但 CNI Overlay 模式下

### aks-188: CNI Overlay AKS 集群中 IP 不足时，尝试使用同 VNET 新 subnet 添加 node pool 报错 GetVnetError: Get...

**Root Cause**: AKS 在 MC_ 资源组中查找 virtual network 但 CNI Overlay 模式下 VNET 不在 MC_ 资源组中，导致找不到。错误信息中 virtual network name 为空，表明 AKS 无法解析 VNET 引用

**Solution**:
1) 参考文档 https://learn.microsoft.com/en-us/azure/aks/node-pool-unique-subnet 正确配置; 2) 确保 --vnet-subnet-id 指定完整的 subnet resource ID（包含正确的 subscription/resourceGroup/vnet/subnet 路径）; 3) 确认 AKS SP/MI 对目标 VNET 有 Network Contributor 权限

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Pod CIDR exhaustion in CNI Overlay. Each node pre-

### aks-754: NAP nodes stuck NotReady in Azure CNI Overlay cluster. NodeNetworkConfig events:...

**Root Cause**: Pod CIDR exhaustion in CNI Overlay. Each node pre-allocates /24 block (256 IPs). Small Pod CIDR (e.g. /21=8 nodes max) runs out, new nodes cannot get Pod IPs and remain NotReady.

**Solution**:
Expand Pod CIDR without cluster recreation: see https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay-pod-expand. After expansion, NotReady nodes auto-recover. azure-cns pods redeploy but existing pods unaffected.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted)]`

## Phase 3: When AKS cluster with Azure CNI Overlay or Pod Sub

### aks-949: Cannot delete subnet or parent VNet after removing AKS cluster. Error: InUseSubn...

**Root Cause**: When AKS cluster with Azure CNI Overlay or Pod Subnet is deleted, the ServiceAssociationLink (SAL) created by subnet delegation to Microsoft.ContainerService/managedClusters should be auto-removed but sometimes remains.

**Solution**:
1) Remove delegation via Azure Portal: VNet > Subnets > select subnet > Delegate to 'None' > Save. 2) Via CLI: 'az network vnet subnet update --resource-group RG --name subnet --vnet-name vnet --remove delegations'. 3) If above fails: use Jarvis actions for undelegation (CSS except China has access with normal AKSJIT permissions). Ref: CloudNativeCompute wiki Subnet-Delegation-and-Undelegation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/Undelegate%20Subnet)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | CNI Overlay AKS 集群中 IP 不足时，尝试使用同 VNET 新 subnet 添加 node pool 报错 GetVnetError: Get... | AKS 在 MC_ 资源组中查找 virtual network 但 CNI Overlay 模式下 VNET 不在 M... | 1) 参考文档 https://learn.microsoft.com/en-us/azure/aks/node-poo... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | NAP nodes stuck NotReady in Azure CNI Overlay cluster. NodeNetworkConfig events:... | Pod CIDR exhaustion in CNI Overlay. Each node pre-allocates ... | Expand Pod CIDR without cluster recreation: see https://lear... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted) |
| 3 | Cannot delete subnet or parent VNet after removing AKS cluster. Error: InUseSubn... | When AKS cluster with Azure CNI Overlay or Pod Subnet is del... | 1) Remove delegation via Azure Portal: VNet > Subnets > sele... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/Undelegate%20Subnet) |
