---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Entra Recommendations for Azure AD Graph Retirement"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FEntra%20Recommendations%20for%20Azure%20AD%20Graph%20Retirement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra Recommendations for Azure AD Graph Retirement

## Summary

Microsoft Entra recommendations feature provides two recommendations to help admins identify applications and service principals using deprecated Azure AD Graph APIs (graph.windows.net):

1. **Migrate Applications** from retiring Azure AD Graph APIs to Microsoft Graph
2. **Migrate Service Principals** from retiring Azure AD Graph APIs to Microsoft Graph

## Key Details

- Recommendations are calculated daily based on actual API requests (not permissions)
- Data covers the past **30 days** of usage
- Applications recommendation = apps registered in your tenant (App Registrations)
- Service Principals recommendation = apps from another tenant/vendor (Enterprise Applications)
- Details show: Operation Name, Request count (30 days), Last Request Date

## FAQ

**App still shows after migration?**
Based on past 30 days of usage. Check last request date. Possible that not all instances were updated. If usage still occurring, possible data/filtering bug (internal - PG can investigate with AppId + TenantId + screenshot).

**How to export the list?**
```powershell
Import-Module Microsoft.Graph.Beta.Identity.DirectoryManagement
Get-MgBetaDirectoryRecommendation -RecommendationId $recommendationId
```

**Applications vs Service Principals?**
- Applications = registered in your tenant, your devs update code
- Service Principals = from vendor/another tenant, contact vendor for update

## Migration Resources

- [Migration overview](https://learn.microsoft.com/en-us/graph/migrate-azure-ad-graph-overview)
- [Migration planning checklist](https://learn.microsoft.com/en-us/graph/migrate-azure-ad-graph-planning-checklist)
- [Migration FAQ](https://learn.microsoft.com/en-us/graph/migrate-azure-ad-graph-faq)

## Troubleshooting

See [Azure AD Recommendations Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/557307/Azure-AD-Recommendations?anchor=troubleshooting)

## ICM Escalations

**Recommendations blade issues:**
- Support Topic: Azure Active Directory Governance, Compliance and Reporting > Azure AD Recommendations
- Owning Service: IDX / Owning Team: AADRecommendations

**Data issues (Azure AD Graph report):**
- Owning Service: Microsoft Graph Service / Owning Team: Microsoft Graph Aggregator
