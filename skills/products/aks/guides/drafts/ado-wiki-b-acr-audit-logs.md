---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Audit Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Audit%20Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Container Registry logs for diagnostic evaluation and auditing

Customer often ask for logs to check who pulled or Pushed images to ACR and even who initiated delete operation on Registry and Repository. This TSG will help to address this scenarios. Please educate customer to use this feature so that they can have visibility of these details which they previously relied on Support.

*Note: The activity log does not have audit log by design. However, we do have a preview feature to show diagnostic logs. Right now, diagnostic logs feature is available by add `feature.enableDiagnosticsLogs` feature flag in Azure Portal: [Preview Portal](https://ms.portal.azure.com/?feature.enableDiagnosticsLogs=true)*

**Public Article is at <https://docs.microsoft.com/en-us/azure/container-registry/container-registry-diagnostics-audit-logs#registry-resource-logs>**

## Preview limitations

Logging of repository-level events doesn't currently include delete or untag events. Only the following repository events are logged:

- Push events for images and other artifacts
- Pull events for images and other artifacts

## Steps to Enable the Audit Log

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to your Registry
3. Navigate to **Diagnostics Settings** on the registry
4. Add Diagnostic Setting. Fill in the details:
   - Provide a name
   - Check **Send to Log Analytics**
   - Select or create a Log Analytics Workspace
   - If you do not have one, follow this [article](https://docs.microsoft.com/en-us/azure/azure-monitor/learn/quick-create-workspace) to create one.
5. **SAVE**
6. Wait for a couple of minutes.
7. Perform any operation on the registry (e.g., push an image).
8. Go to **Logs** → Expand **Log Management** → **ContainerRegistryRepositoryEvents** → Run the query to get the details.

## Querying Audit Logs

Once diagnostic settings are configured, query the `ContainerRegistryRepositoryEvents` table in Log Analytics to see who pushed/pulled images:

```kql
ContainerRegistryRepositoryEvents
| where TimeGenerated > ago(1d)
| project TimeGenerated, Identity, Repository, Tag, OperationName, CallerIpAddress
| order by TimeGenerated desc
```

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
