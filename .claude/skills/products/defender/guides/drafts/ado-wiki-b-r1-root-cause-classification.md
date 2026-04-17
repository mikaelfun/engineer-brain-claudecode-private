---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[TSG] - Security Alerts initial investigation/[Procedure] - Identify the Root Cause Classification when closing a case"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTSG%5D%20-%20Security%20Alerts%20initial%20investigation/%5BProcedure%5D%20-%20Identify%20the%20Root%20Cause%20Classification%20when%20closing%20a%20case"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Alerts RootCause Tagging Map — Procedure for Case Closure

## What and Why

When closing a case, you are **required to provide the correct root-cause topic**. Under L3 "Investigating Security Alerts for root cause/evidence/False-positive" there is a list of **buckets** categorizing alerts per area. The list is provided in the root-cause tree at **RootCauseL4** level.

Categorizing the case is necessary for supportability and PG to understand which team should review and investigate.

> **Prerequisite**: Extract the alert provider name as described in the Security Alerts initial investigation TSG.

## Find the Correct Bucket Using Alert ID

```kql
cluster('Rome').database('DetectionAlerts').GetRootCauseL4('{alertId}')
```

Example:
```kql
cluster('Rome').database('DetectionAlerts').GetRootCauseL4('2517808671699577562_fbf37841-d839-4509-b5fd-a801fdca7166')
```

Returns: `SystemAlertId | ProviderName | AlertType | RootCauseL4`

If the `GetRootCauseL4` function is broken, use this alternative:

```kql
let alert = cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
| where SystemAlertId == '{alertId}' | take 1;
AddRootCauseL4(alert) | project SystemAlertId, ProviderName, AlertType, RootCauseL4
```

## Find Buckets for a Set of Alerts

```kql
let alerts = <alerts query>;
cluster("Rome").database("DetectionAlerts").AddRootCauseL4(alerts)
| project ProviderName, AlertType, RootCauseL4
```

> Use `https://romeuksouth.uksouth.kusto.windows.net` for Europe cluster and `https://rome.kusto.windows.net` for the rest of the world.

### Example 1: Random 10 alerts

```kql
let alerts = cluster("Rome").database("ProdAlerts").table("SecurityAlerts") | take 10;
cluster("Rome").database("DetectionAlerts").AddRootCauseL4(alerts)
| project ProviderName, AlertType, RootCauseL4
```

### Example 2: All alerts per provider for a subscription in the last month

```kql
let alerts = cluster("Rome").database("ProdAlerts").SecurityAlertsFromAllRegions("{subscriptionId}", now(-31d), now())
| summarize arg_max(TimeGeneratedUtc, *) by ProviderName;
cluster("Rome").database("DetectionAlerts").AddRootCauseL4(alerts)
| project ProviderName, AlertType, RootCauseL4
```

## Complete List of Buckets (RootCauseL4)

1. AF alerts
2. AKS
3. AntimalwarePublisher
4. App Services alerts
5. ARM
6. ASC-R3 Alerts
7. CloudNetworkSecurity
8. DNS Alerts
9. FilelessAttackDetection
10. Key vault alerts
11. MDATP Alerts
12. Networking alerts
13. SQL alerts
14. Storage alerts
15. Windows/Linux alerts — MSTIC provider
16. Other alert provider

## Tagged Bucket Summary Query

```kql
let startDate = datetime(2021-05-01);
let endDate = datetime(2021-05-31);
cluster('u360sec.kusto.windows.net').database("KPISupportData").AllCloudsSupportIncidentWithReferenceModel
| where ClosedDateTime between (startDate .. endDate)
| where DerivedProductIDStr == ("15947")
| where RootCauseL2 == "Security Alerts Investigation"
| where RootCauseL3 == "Investigating Security Alerts for root cause/evidence/False-positive"
| summarize count() by RootCauseL4
```
