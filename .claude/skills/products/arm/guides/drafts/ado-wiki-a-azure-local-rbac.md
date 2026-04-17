---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/RBAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure Local Disconnected Operations/Readiness/Infrastructure/RBAC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Local (Azure Stack HCI) — RBAC for Arc-enabled VMs

Use built-in RBAC roles to control access to Azure Local VMs enabled by Azure Arc.

## Built-in RBAC Roles

| Role | VMs | VM Resources |
|------|-----|--------------|
| **Azure Stack HCI Administrator** | Create, list, delete, start, stop, restart VMs | Create, list, delete ALL VM resources including logical networks, VM images, storage paths |
| **Azure Stack HCI VM Contributor** | Create, list, delete, start, stop, restart VMs | Create, list, delete VM resources EXCEPT logical networks, VM images, storage paths |
| **Azure Stack HCI VM Reader** | List all VMs | List all VM resources |

## Key Points

- **Administrator** can register the system and assign roles to other users
- **VM Contributor** cannot register the system, assign roles, or create shared resources (logical networks, VM images, storage paths)
- **VM Reader** is view-only

## Prerequisites

1. Complete Azure Local requirements
2. Have Owner or User Access Administrator access on the subscription

## Assigning Roles

1. Azure Portal → Subscription → Access control (IAM) → Role assignments
2. Add → Add role assignment → Select built-in role
3. Select member (user, group, or service principal)
4. Review + assign

Reference: [Use built-in RBAC roles for Azure Local VM](https://learn.microsoft.com/en-us/azure/azure-local/manage/assign-vm-rbac-roles?view=azloc-2505)
