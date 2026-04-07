---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Change Analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Container Registry Change Analysis

Use this guide when a customer wants to know what configuration flags were changed in their ACR and who initiated the change (e.g., admin account disabled/enabled, SKU change, retention policy, content trust flag).

**Note:** This is **not** the same as ACR [Audit Logs](../ado-wiki-a-acr-audit-logs.md). Change Analysis tracks configuration-level changes, not registry operation events (push/pull).

## How to Check Flag Change Details

1. **Register the `Microsoft.ChangeAnalysis` resource provider** on the subscription:
   - Go to the Azure Portal subscription → Resource Providers
   - Search for `Microsoft.ChangeAnalysis`, select it, and click **Register**
   - Wait for status to show **Registered**

2. **Locate the Change Analysis service** in the Azure Portal:
   - Search for **Change Analysis** in the global search bar

3. **Select the Resource Group and the Registry** from the filters in Change Analysis

4. **Review the change list:**
   - You will see details of what changes were made and who initiated them
   - SKU changes, AdminUser changes are clearly labelled
   - Retention / Content Trust flag changes may appear as `NAME=status` (further detail available in Activity Logs)

5. **For detailed before/after values:**
   - Navigate to **Activity Logs** → select the operation → click **Change History (preview)**
   - This shows the previous value and the new value for each property

## Example Scenarios Covered

- Customer claims admin account was disabled/enabled unexpectedly → Use Change Analysis to see who changed it and when
- Customer wants to know which policy or flag changed recently → Filter Change Analysis by the registry resource
- Detailed diff for retention or content trust flags → Supplement with Activity Logs Change History
