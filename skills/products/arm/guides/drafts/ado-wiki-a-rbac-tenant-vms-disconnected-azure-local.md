---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Use Role-based Access Control to Manage Tenant VMs in Disconnected Operations for Azure Local"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FWorkloads%2FUse%20Role-based%20Access%20Control%20to%20Manage%20Tenant%20VMs%20in%20Disconnected%20Operations%20for%20Azure%20Local"
importDate: "2026-04-06"
type: troubleshooting-guide
---

### Use Role-based Access Control to Manage Tenant VMs in Disconnected Operations for Azure Local

#### Introduction

Role-based Access Control (RBAC) is a critical feature in Azure that helps manage who has access to Azure resources, what they can do with those resources, and what scopes they can access. This article provides an overview of how to use RBAC to manage tenant Virtual Machines (VMs) in disconnected operations for Azure Local.

#### Overview of Azure RBAC

Azure RBAC is the primary method for managing access in Azure. It allows you to assign roles to users, groups, and service principals, defining their permissions to access and manage Azure resources. By using RBAC, you can ensure that users have the least privilege necessary to perform their tasks, enhancing security and reducing the risk of unauthorized access.

#### Managing Access to Tenant VMs with Azure Arc

Azure Arc enables you to manage resources across multiple environments, including on-premises and other cloud providers, from a single control plane. When managing tenant VMs in disconnected operations for Azure Local, you can use the Azure portal or Azure CLI to perform various operations such as creating, updating, and deleting VMs.

To manage access to these VMs in a disconnected environment, follow these steps:

1. **Grant Resource Group Access**:
   - Go to the Azure portal and navigate to the Resource groups.
   - Select the desired resource group.
   - Click on Access control (IAM) and select + Add > Add role assignment.
   - Choose a role and assign it to a user, group, or service principal.

2. **Grant Subscription Access**:
   - Navigate to Subscriptions in the Azure portal.
   - Select the subscription you want to manage.
   - Click on Access control (IAM) and select + Add > Add role assignment.
   - Choose a role and assign it to a user, group, or service principal.

#### Best Practices

- **Least Privilege Principle**: Always grant the minimum permissions necessary for users to perform their tasks.
- **Group-Based Access**: Assign roles to groups instead of individual users to simplify access management and ensure consistency.
- **Regular Audits**: Periodically review and audit access permissions to ensure they are still necessary and appropriate.

#### References

- [Manage access to your Azure environment with Azure role-based access control](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-setup-guide/manage-access)
- [Assign Azure roles using the Azure portal](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal)
- [Disconnected operations for Azure Local (preview)](https://learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-overview?view=azloc-2505)
- [Supported operations for Azure Local VMs enabled by Azure Arc](https://learn.microsoft.com/en-us/azure/azure-local/manage/virtual-machine-operations?view=azloc-2505)
