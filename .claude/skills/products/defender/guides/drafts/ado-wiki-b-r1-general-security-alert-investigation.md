---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[TSG] - Security Alerts initial investigation/[TSG] General Security Alert investigation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTSG%5D%20-%20Security%20Alerts%20initial%20investigation/%5BTSG%5D%20General%20Security%20Alert%20investigation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# General Security Alert Investigation — TSG

## Overview

ASC/MDC receives alerts from many alert providers. The **alert provider** is the first value to identify when the alert name/description is unclear.

## Step 1: Retrieve Alert Information

```kql
cluster("Rome.kusto.windows.net").database("ProdAlerts").SecurityAlertsFromAllRegions('{subscriptionId}', now(-61d), now())
```

Or query the SecurityAlerts table directly:

```kql
database("ProdAlerts").SecurityAlerts
| where Metadata["StoreManager.EffectiveSubscriptionId"] == "{subscriptionId}"
| where Metadata["StoreManager.Published"] == "True"
| where ExtendedProperties["Source IP(s) [#attempts]"] contains "X.X.X.X"
| where AlertDisplayName == "Detected suspicious network activity"
| where Severity != "Silent"
| where StartTimeUtc > ago(31d)
| extend Description = tostring(ExtendedProperties["AnalyticDescription"])
| extend CompromisedHost = tostring(ExtendedProperties["Compromised Host"])
| extend ResourceType = tostring(ExtendedProperties["resourceType"])
| project StartTimeUtc, EndTimeUtc, AlertDisplayName, Description, IsIncident, CompromisedEntity, AlertType, Severity, ProviderName, VendorName, WorkspaceResourceGroup, Metadata, ExtendedProperties, IngestorMetadata, TimeGeneratedUtc, Entities
| sort by StartTimeUtc desc
```

## Step 2: Check Actions Taken on Alerts by Partners/Providers

```kql
let lookBackTime = 10d;
let mdcSystemAlertId = "2517173970497622265_8e9e509b-7cad-4c6a-aec4-605ddc54e180";
cluster('https://rome.kusto.windows.net').database("DetectionLogs").ServiceFabricDynamicOE
| where env_time > ago(lookBackTime)
| where serviceName == "fabric:/ResourceProviderApp/ResourceProviderAppService"
| where env_cloud_environment =~ 'prod'
| where operationName contains "InnerPartnerAlertsUpdateAsync"
| where tostring(customData["alertList"]) contains mdcSystemAlertId
| extend RpLocation = "CUS"
| union (
    cluster('https://romeuksouth.uksouth.kusto.windows.net').database("DetectionLogs").ServiceFabricDynamicOE
    | where env_time > ago(lookBackTime)
    | where serviceName == "fabric:/ResourceProviderApp/ResourceProviderAppService"
    | where env_cloud_environment =~ 'prod'
    | where operationName contains "InnerPartnerAlertsUpdateAsync"
    | extend customData = todynamic(customData)
    | where tostring(customData["alertList"]) contains mdcSystemAlertId
    | extend RpLocation = "EU"
)
| extend updateOrigin = iff(customData["isM365Update"] == "true", "M365D", "sentinel")
| project env_time, updateOrigin, RpLocation, updatedAlerts = customData["alertList"], isUpdateSuccessful = customData["getUpdateActionIsSuccess"], incomingNewStatus = customData["Status"], MDCnewStatus = customData["alertNewStateReadable"]
```

> Note: Select RomeEU for European region subscriptions, Rome for the rest of the world.

## Step 3: Check IP Ownership (Internal Use Only — Do NOT Share with Customer)

```kql
let subs = cluster('rometelemetrydata').database("RomeTelemetryProd").GetDimSubscription()
| where SubscriptionStatus == "ACTIVE";
cluster('aznwsdn').database('aznwmds').VipOwnershipSnapshotEvent
| where TIMESTAMP >= datetime(2024-11-06 00:00:00.0)
| where TIMESTAMP <= datetime(2024-11-06 23:59:59.0)
| where IPAddress == "0.0.0.0"
| join kind=inner subs on SubscriptionId
| project IPAddress, SubscriptionId, FriendlySubscriptionName, CustomerName, SubscriptionStatus, IsExternalSubscription, FirstPartyUsage, Accessibility, CloudCustomerDisplayName, IsFraud, OfferName
```

## Step 4: Determine Required Defender Plan for an Alert

Alerts are generated only when the corresponding **Defender plan** is enabled. Each alert belongs to a specific workload category and requires the associated pricing bundle.

When `RequiredBundle` = `Default:Default` → the alert is included in the **free tier** (no paid plan required).

Reference: [MDC Security Alerts Reference Guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/alerts-reference)

Query to find required plan for an alert type:

```kql
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdAlerts').SecurityAlerts,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdAlerts').SecurityAlerts
| where StartTimeUtc >= ago(10d)
| where AlertDisplayName == "{AlertDisplayName}"
| distinct AlertDisplayName, RequiredPlan = tostring(Metadata["DetectionInternalAlertsProcessing.RequiredPricingPlans"])
```
