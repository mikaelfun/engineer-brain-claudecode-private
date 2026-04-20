---
title: "Entra Portal (ADIbizaUX) Login Loop Kusto Investigation"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Account management/Entra portal (ADIbizaUX)/Kusto.md"
product: entra-id
tags: [Entra-portal, ADIbizaUX, kusto, login-loop, mooncake, SvcEvents]
21vApplicable: true
createdAt: "2026-04-18"
---

# Entra Portal Login Loop Investigation via Kusto

## Cluster & Database
- Cluster: `azportalmc2.chinaeast2.kusto.chinacloudapi.cn`
- Database: `AzurePortal`

## Login Loop Detection Query

```kql
SvcEvents
| where browserId == "<browserId>"
| where message contains "RedirectingToIdentityProvider" or message == "Authorization code received."
| summarize count() by message
| project count_, message
```

## Interpretation
- **RedirectingToIdentityProvider**: Logged when portal redirects to AAD (portal.azure.cn -> login.partner.microsoftonline.cn)
- **Authorization code received**: Logged when AAD returns to portal (login.partner.microsoftonline.cn -> portal.azure.cn/signin/index)
- If you see **multiple counts** of these logs, it confirms a login loop
- Single count of each = normal single login round, no loop
