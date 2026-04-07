---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Viewing Alerts and Incidents/Alerts and incidents telemetry"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Viewing%20Alerts%20and%20Incidents/Alerts%20and%20incidents%20telemetry"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Find when an incident was created

```q
let inc_ID="{incidentID}";
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Operations
| where around(env_time, datetime(4/19/XXXX 7:19:45 PM), 1d)
| where operationName == "Sentinel.CasesManagement.Cases.CasesManager.LogCaseCreation"
| where customData has inc_ID
| extend workspaceId = customData.WorkspaceId, incidentId = customData.ArmResourceName, incidentNumber = customData.CaseNumber
| where incidentId == inc_ID
| extend providerName = customData.ProviderName, createdTimeUtc = customData.CreatedTimeUtc, alertIds = customData.AlertIds
| project env_time, clusterName, serviceName, operationName, resultType, durationMs, workspaceId, incidentId, incidentNumber, providerName, createdTimeUtc, alertIds
```

# Find matching incident and alert id in Sentinel

```q
let startTime = datetime(XXXX-07-29);
let endTime = datetime(XXXX-07-31);
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').ServiceFabricDynamicOE
| where env_time between (startTime .. endTime)
| where operationName == "Sentinel.CasesManagement.Cases.CasesManager.IngestNewCase"
| extend workspaceId = tostring(todynamic(customData).workspaceId)
| extend CaseNumber = tostring(todynamic(customData).CaseNumber)
| extend AlertIds = tostring(todynamic(customData).AlertIds)
| extend caseArmResourceName = tostring(todynamic(customData).caseArmResourceName)
| extend SystemAlertId = tostring(todynamic(customData).SystemAlertId)
| where workspaceId == "XXXXXXXXXXXXXXXXX"
| where CaseNumber == "XXXXX"
| project env_time, operationName, AlertIds, caseArmResourceName, SystemAlertId
| order by env_time asc
```

# Check when this incident was closed on Sentinel side

```q
let startTime = datetime(XXXX-07-29);
let endTime = datetime(XXXX-07-31);
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').ServiceFabricDynamicOE
| where env_time between (startTime .. endTime)
| where operationName == "Sentinel.CasesManagement.Cases.CasesManager.LogCaseUpdate"
| extend ws = tostring(todynamic(customData).originalWorkspaceId)
| extend caseNumber = tostring(todynamic(customData).originalCaseNumber)
| where ws =="XXXX"
| where caseNumber == "XXXX"
| where customData contains "XXXXXX" //alert
| extend updatedStatus = tostring(todynamic(customData).updatedStatus)
| extend originalStatus = tostring(todynamic(customData).originalStatus)
| extend IncidentChangeSource = tostring(todynamic(customData).IncidentChangeSource)
| extend originalArmResourceName = tostring(todynamic(customData).originalArmResourceName)
| extend originalAlertProducts = tostring(todynamic(customData).originalAlertProducts)
| extend originalProviderAlertIds = tostring(todynamic(customData).originalProviderAlertIds)
| extend updatedAlertIds = tostring(todynamic(customData).updatedAlertIds)
| project env_time, rootOperationId, originalAlertProducts, originalStatus , updatedStatus, IncidentChangeSource,originalArmResourceName, originalProviderAlertIds, updatedAlertIds
| order by env_time asc
```

# Verify Cases published successfully the changes

```q
let startTime = datetime(XXXX-07-29);
let endTime = datetime(XXXX-07-31);
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').ServiceFabricDynamicOE
| where env_time between (startTime .. endTime)
| where rootOperationId == "XXXXXXX"
| where operationName == "Sentinel.CasesManagement.IncidentPublishing.CasePublishingManagerV2.PublishCase"
| extend workspaceId = tostring(todynamic(customData).workspaceId)
| extend caseId = tostring(todynamic(customData).caseId)
| extend numberOfSecurityAlerts = tostring(todynamic(customData).numberOfSecurityAlerts)
| project env_time, workspaceId, operationName, resultType, caseId, numberOfSecurityAlerts
| order by env_time asc
```

# Query to check IP, SUB and who is using it (Internal use only)

```q
let subs = cluster('rometelemetrydata').database("RomeTelemetryProd").GetDimSubscription()
| where SubscriptionStatus == "ACTIVE";
cluster('aznwsdn').database('aznwmds').VipOwnershipSnapshotEvent
| where TIMESTAMP >= datetime(XXXX-11-06 00:00:00.0)
| where TIMESTAMP <= datetime(XXXX-11-06 23:59:59.0)
| where IPAddress == "0.0.0.0"
| join kind=inner subs on SubscriptionId
| project IPAddress,SubscriptionId,FriendlySubscriptionName,CustomerName,SubscriptionStatus,IsExternalSubscription, FirstPartyUsage, Accessibility, CloudCustomerDisplayName, IsFraud, OfferName
```
