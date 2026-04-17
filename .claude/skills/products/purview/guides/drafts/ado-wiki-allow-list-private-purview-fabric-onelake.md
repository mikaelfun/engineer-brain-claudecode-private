---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Apps - Data Governance/Troubleshooting Guides/Data Quality/Allow-List for Private Purview + Fabric OneLake Cx"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Quality%2FAllow-List%20for%20Private%20Purview%20%2B%20Fabric%20OneLake%20Cx"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Allow-List for Private Purview + Fabric OneLake Cx

For cases regarding an "Allow-list" for Private Purview/Purview Data Map and Fabric OneLake you must ping a PM (**Sri Kutuva, srik@microsoft.com or Shafiq Mannan, shafiqul.mannan@microsoft.com**) and share the following information to them so they can create the request:

To allowlist a customer to use Fabric Lakehouse for DQ, we need the below information:

| Requestor | Tenant ID | Organization Name | Account Name | Account ID | Catalog ID | Region |
|--|--|--|--|--|--|--|

_Note: If your customer provides you the Tenant ID, you can check the logs for the remaining information:_

You can find that with this Kusto Query:
(Cx should always provide either TenantID or OrganizationName)

```kql
cluster('babylon.eastus2.kusto.windows.net').database("babylonMdsLogs").AccountInfo
|where tenantId == '<tenantID>'
```

Ensure the following:

- ReconciledStatus = Active
- AccountTier = EnterpriseTier

or

```kql
cluster('babylon.eastus2.kusto.windows.net').database("babylonMdsLogs").AccountInfo
|where OrganizationName contains "<CompanyName>"
```
