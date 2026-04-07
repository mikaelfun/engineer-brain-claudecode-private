---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Change Analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Container Registry Change Analysis

Often we come across situation where customer would like to know what flags were changed in their Azure Container Registry and who initiated the change. We have received numerous feedback to allow visibility of these information to customers so that customer need to necessarily contact support.

For example:

1. Customer claims that admin account associated with registry is disabled/enabled.
2. Which property or policy associated with the registry is changed recently.

Now customer has visibility to these information in their portal. Note this is **not** same as ACR [audit logs](../ACR-Audit-Logs).

## How to check the flag change details

### Step 1: Register the Microsoft.ChangeAnalysis resource provider

1. In the Azure Portal, navigate to your subscription.
2. Search for **Resource Providers**.
3. Find and **Register** `Microsoft.ChangeAnalysis`.
4. Wait until the status shows **Registered**.

### Step 2: Make changes on the Registry (for testing)

For example:
- Changed SKU from Standard to Premium
- Disabled Admin Account
- Enabled Retention
- Enabled Content Trust

### Step 3: Locate the Change Analysis Service in Portal

Search for "Change Analysis" in the Azure Portal global search.

### Step 4: Select the Resource Group and the Registry

- Use the filter dropdowns to select the target resource group and registry.
- The results will show what changes were made and who initiated them.
- Note: For some flags (like "Retention" and "Content Trust"), the change shows as "NAME=status" — see Step 5 for detailed info.

### Step 5: View detailed change info via Activity Logs

1. Navigate to **Activity Logs** on the registry.
2. Select the relevant operation.
3. Click **Change History (preview)**.
4. This shows the **previous value** and the **new value** for the changed property.

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
