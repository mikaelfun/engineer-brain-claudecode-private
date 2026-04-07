---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/Kusto Queries/Windows 365 | Cloud PC/Get Tenant List"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FSupport%20Tools%2FKusto%20Queries%2FWindows%20365%20%7C%20Cloud%20PC%2FGet%20Tenant%20List"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get Tenant List (Kusto Queries)

> **Note:** fn_GetWorkspaceEntity is in Global Reporting Kusto, limited to Dev/SaaF team.

## Business (VSB) Tenant List
```kql
cluster('cpcdeedprptprodgbl.eastus2').database("Reporting").fn_GetWorkspaceEntity
| where ServicePlanType == "VSB"
```

## Enterprise Tenant List
```kql
cluster('cpcdeedprptprodgbl.eastus2').database("Reporting").fn_GetWorkspaceEntity
| where ServicePlanType == "Enterprise"
| distinct TenantId
```

## Flex Tenant List
```kql
cluster('cpcdeedprptprodgbl.eastus2').database("Reporting").fn_GetWorkspaceEntity
| where LicenseCategory == "Flex"
| distinct TenantId
```

## Gov (GCC & GCCH)
> Use Security "Client Security: dSTS-Federated" when adding cluster connection.
```kql
cluster('cpcdeedprptghpgbl.usgovvirginia.kusto.usgovcloudapi.net').database('Reporting').fn_GetWorkspaceEntity
| union cluster('cpcdeedprptgcpgbl.usgovvirginia.kusto.usgovcloudapi.net').database('Reporting').fn_GetWorkspaceEntity
| distinct TenantId
```
