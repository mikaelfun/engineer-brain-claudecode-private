---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[TSG] - Sample Alerts"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTSG%5D%20-%20Sample%20Alerts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Sample Alerts in Microsoft Defender for Cloud — TSG

## Summary

This article provides an overview of the Sample Alerts feature in Microsoft Defender for Cloud and troubleshooting guidance when simulated alerts do not appear.

## Processing Pipeline

### UI Version
1. Customer initiates alert generation in UI
2. Request moves to Alerts RP → Pipeline Processing
3. Simulated alerts created and stored in Azure Resource Graph (ARG)
4. Alerts displayed in UI from ARG

### API Version
1. REST Client sends simulate alerts POST request
2. Request moves to Alerts RP → Pipeline Processing
3. Simulated alerts created and stored in Security Alerts Table
4. Alerts retrieved via get alerts request

## Key Facts

- **Supported Regions**: Public cloud only, Central US (CUS) region
- **Identifying Simulated Alerts**: AlertType starts with `SIMULATED`, provider name = `AlertSimulator`
- **Alert Bundles**: AppServices = 2 alerts, VirtualMachines = 6 alerts, total ~25 alerts across all bundles
- **Throttling**: 500 alerts of the same alert type per resource per 24 hours
- **Permissions Required**: Owner permission on the subscription

## Troubleshooting: Customer Cannot See Alerts

### Step 1a: Help Customer Find Alerts in UI

- Wait a few minutes and reload — ARG may still be processing
- Check medium severity alerts (some simulated alerts are medium severity)
- Check ARG directly via Resource Graph Explorer:

```kql
securityresources
| where type == "microsoft.security/locations/alerts"
| where properties.AlertType startswith "SIMULATED"
```

With subscription filter:

```kql
securityresources
| where type == "microsoft.security/locations/alerts"
| where id startswith "/subscriptions/{subscriptionId}"
| where properties.AlertType startswith "SIMULATED"
```

### Step 1a: Help API Customer Find Alerts

- Ensure customer sent GET alerts request **after** the simulate POST — simulated alerts are NOT returned as the POST response
- Ensure GET request is for the same subscription as the simulate request
- Search for "SIMULATED" in the GET response text

### Step 1b: Identify the Problem

- Check customer permissions: need **Owner** permission on the subscription
- Check throttling: 500 simulations per specific subscription per day
- Check if suppression rules are blocking simulated alerts

## Step 2: Check Customer's ARM Request

Check if ARM received the simulate request:

```kql
// Execute on: https://armprodgbl.eastus.kusto.windows.net/ARMProd
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpOutgoingRequests
    | where TIMESTAMP > ago(1d)
)
| where operationName == "POST/VERSIONS/SUBSCRIPTIONS/PROVIDERS/MICROSOFT.SECURITY/LOCATIONS/ALERTS/SIMULATE"
| where hostName == "cus.rp.alerts.security.azure.com"
| where subscriptionId == "<subscriptionId>"
| project PreciseTimeStamp, TaskName, correlationId
```

- If request found: take correlationId and investigate pipeline
- If no matching request: verify customer is sending the request correctly
