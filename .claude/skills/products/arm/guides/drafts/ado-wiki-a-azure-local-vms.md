---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Azure Local VMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/Azure%20Local%20VMs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> Applies to: Azure Local 2411.1 and later

# Azure Local VM Management for Disconnected Operations

Azure Local VM management lets you set up and manage VMs in your on-premises Azure Local environment. IT admins can use Azure management tools to enable self-service VM management and automate deployment.

## Supported OS Versions

- Windows Server 2025 and 2022
- Windows 10 Enterprise
- Ubuntu 20.04, 22.04, and 24.04 LTS

## Limitations

### VM Images
- Can only create VM images from a local share
- Can only create VM images using Azure CLI (portal not supported)
- Marketplace, Azure storage account, and images from existing Azure Local VM are not supported

### Network Interfaces
- Can only create network interfaces in CLI (portal not supported)

### Storage Paths
- Can only create storage paths in CLI (portal not supported)
- Cannot delete storage paths if connected to a VM or VM image — delete VM/image first

### Logical Networks
- Can only create logical networks in CLI (portal not supported)
- May not be fully loaded in portal
- Deleting a logical network used by a network interface doesn't fail as expected — results in **Failed** state. Recreate to recover.

### Proxy Servers
- Proxy servers are not supported for connecting to outbound internet

### Machine Creation
- Create via **Azure Arc** > **Machines** > **Add/Create** > **Create a machine in a connected host environment**
- The **Create** button in Virtual Machines section of Azure Local resource cannot be used

## Create Azure Local VMs Workflow

1. Review prerequisites (AzCLI 2.60.0, stack-hci-vm v1.3.0)
2. Assign RBAC roles
3. Create storage path (CLI only)
4. Create VM image from local share (CLI only)
5. Create logical network (CLI only)
6. Create network interface (CLI only)
7. Create VM via Azure Arc > Machines

## References

- [Azure Local VM management overview](https://review.learn.microsoft.com/en-us/azure/azure-local/manage/azure-arc-vm-management-overview)
- [Disconnected operations Arc VM](https://review.learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-arc-vm)
