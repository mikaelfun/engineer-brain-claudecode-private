---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Administration (Provisioning & RBAC)/Provisioning Managed Event Hub"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FProvisioning%20Managed%20Event%20Hub"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Provisioning Managed Event Hub for Microsoft Purview

## Background

Managed Event Hub has been **deprecated** as of December 15, 2022. Accounts provisioned after this date do not include a managed Event Hub.

Customers can provision a custom Event Hub: https://learn.microsoft.com/en-us/purview/configure-event-hubs-for-kafka — however, for now only public access is supported.

For customers needing secure/private Event Hub access, there are two methods to still leverage the managed Event Hub:

## Method 1: Provision a New Purview Account with Managed Event Hub

Follow the PowerShell tutorial: https://learn.microsoft.com/en-us/purview/create-microsoft-purview-powershell?tabs=azure-powershell

## Method 2: Update Existing Purview Account via REST API

### Step-by-step:

1. **GET** the Purview account details:
   ```
   GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Purview/accounts/{accountName}?api-version=2021-07-01
   ```
   Reference: https://learn.microsoft.com/en-us/rest/api/purview/accounts/get?tabs=HTTP

2. **PUT** the same URL with the GET response body, adding `"managedEventHubState":"Enabled"` after the `managedResourceGroupName` property:
   ```
   PUT https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Purview/accounts/{accountName}?api-version=2021-07-01
   ```

3. Expected response: **201 Created** (new resource created)

4. Verify by running the GET again — Managed Event Hub should now appear in the response under managedResources.

5. In Azure Portal, check the **Managed resources** tab (may need page refresh) — Event Hubs namespace should now show with Enable/Disable buttons.
