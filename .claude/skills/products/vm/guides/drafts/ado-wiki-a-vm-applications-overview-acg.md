---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/VM Applications Overview_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FVM%20Applications%20Overview_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Applications Overview (Azure Compute Gallery)

## Overview

VM Applications is a resource type in Azure Compute Gallery that simplifies management, sharing and global distribution of application packages.

## Feature Details

While you can create an image of a VM with apps pre-installed, you would need to update your image each time you have application changes. Separating your application installation from your VM images means there's no need to publish a new image for every line of code change.

Application packages provide benefits over other deployment and packaging methods:

- Grouping and versioning of your packages
- VM applications can be globally replicated to be closer to your infrastructure
- Sharing with other users through Azure RBAC
- Support for virtual machines, and both flexible and uniform scale sets
- If you have NSG rules applied, downloading packages from an internet repository might not be possible. VM applications can work with locked-down VMs without private links.
- VM applications can be used with the DeployIfNotExists policy.

## Concepts

- **Gallery Resource**: Container resource providing metadata and private sharing. Gallery name must be unique per subscription.
- **VM Application**: Logical resource storing common metadata for all versions. Represents an application object versioned independently.
- **VM Application Version**: Deployable version, multi-regional, independently scalable. Must be replicated to a region before deployment.

## How it Works

### Publishing
Publisher creates packages and defines install actions. Calls CAPS through ARM. CAPS calls PIR for each region. PIR creates 1-3 replicas per region.

### Deploying
Deployer uses the application. CRP automatically adds VMApp Extension. Package URIs and actions sent via Fabric/goal state. VMApp extension calls HostGA to retrieve packages (actual SAS URL not visible to VM).

## Support Boundaries

Supported by Azure VM team. Escalation channels:
1. **Extensions** - For VmApp extension issues (install/remove/deployment): MGMT - Agent and Extensions (AVA) Teams channel
2. **Shared Image Gallery** - For publishing issues: CONF - Compute Gallery - AIB (AVA) Teams channel

## Current Limitations

| Limitation | Detail |
|---|---|
| Max 3 replicas per version | Maximum replicas per region is three |
| Retrying failed installations | Must remove app from profile and re-add |
| Max 25 applications per VM | No more than 25 apps at any point |
| 2GB application size | Maximum file size per version |
| No reboot guarantees | If script requires reboot, place app last during deployment |
| Requires VM Agent | VM agent must exist and receive goal states |
| Not available in Azure Gov and sovereign clouds | In progress |
| Storage access requirements | Storage account needs public access or SAS URI with read privilege |
| Move operations not supported | Moving VMs with VM Apps to other resource groups not supported |
| Multiple versions of same app | Cannot have multiple versions of same application on a VM |

**Note**: For ACG and VM Applications, Storage SAS can be deleted after replication.

## ASC Integration

Application details show up under the VMAppExtension in ASC.

## FAQs

1. **Key benefits**: Grouping/versioning, global replication, RBAC sharing, VM/VMSS support
2. **Download location**:
   - Linux: `/var/lib/waagent/Microsoft.CPlat.Core.VMApplicationManagerLinux/<appname>/<version>`
   - Windows: `C:\Packages\Plugins\Microsoft.CPlat.Core.VMApplicationManagerWindows\1.0.4\Downloads\<appname>\<version>`

## Public Documentation

- [Overview of VM applications](https://docs.microsoft.com/en-us/azure/virtual-machines/vm-applications)
- [Create and deploy VM applications](https://docs.microsoft.com/en-us/azure/virtual-machines/vm-applications-how-to?tabs=portal)
