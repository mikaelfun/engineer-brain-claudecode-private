---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Audit Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Audit%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Container Registry Audit Logs for Diagnostic Evaluation

Customers often ask for logs to check who pulled or pushed images to ACR, and who initiated delete operations on a registry or repository. This guide addresses those scenarios and instructs customers on how to enable diagnostic audit logs.

**Note:** The activity log does not have audit log by design. However, there is a preview feature to show diagnostic logs via: [Preview Portal](https://ms.portal.azure.com/?feature.enableDiagnosticsLogs=true)

**Public Article:** <https://docs.microsoft.com/en-us/azure/container-registry/container-registry-diagnostics-audit-logs#registry-resource-logs>

## Preview Limitations

Logging of repository-level events doesn't currently include delete or untag events. Only the following repository events are logged:

- Push events for images and other artifacts
- Pull events for images and other artifacts

## Steps to Enable the Audit Log

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to your Registry
3. Navigate to **Diagnostics Settings** on the registry
4. Click **Add Diagnostic Setting**. Fill in the details:
   - You need to have a Log Analytics workspace. If you do not have one, follow [this article](https://docs.microsoft.com/en-us/azure/azure-monitor/learn/quick-create-workspace) to create one.
   - Select **Send to Log Analytics** and choose your workspace
5. Click **SAVE**
6. Wait a couple of minutes
7. Perform any operation on the registry (e.g., push an image)
8. Go to **Logs** → Expand **Log Management** → **ContainerRegistryRepositoryEvents** → Run the query to get details

The `ContainerRegistryRepositoryEvents` table in Log Analytics will show push and pull events with user identity and other metadata.

## Educate Customers

Customers should be educated to use this feature so they can have visibility into registry events independently, without needing to contact Support for every inquiry.
