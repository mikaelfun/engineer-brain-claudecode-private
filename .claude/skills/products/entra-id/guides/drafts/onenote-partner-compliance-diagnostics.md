---
title: Partner Compliance Diagnostics
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune 2/## MISC/Partner Compliance.md"
product: entra-id
date: 2026-04-18
tags: [partner compliance, Intune, Kusto, GraphApiProxyLibrary, device compliance]
---

# Partner Compliance Diagnostics

## Overview
Troubleshoot 3rd-party MDM partner device compliance status reporting to Entra ID via Intune.

## Key Kusto Query: GraphApiProxyLibrary

```kql
GraphApiProxyLibrary
| where env_cloud_name == "AMSUC0101"
| where url contains "<AAD device id>"
| where contextId == '<Tenant id>'
// | where scenarioInstanceId == "<Partner Message id>"
| where responseBody contains "isCompliant"
| project env_time, url, requestBody, httpVerb, httpStatusCode, responseBody,
          env_cloud_name, ActivityId, contextId, scenarioInstanceId, requestIds, TaskName
| order by env_time asc
```

## Key Kusto Query: IntuneEvent (Detail by MessageId)

```kql
IntuneEvent
| where env_time > ago(10d)
| where env_cloud_name == "AMSUC0101"
| where ScenarioInstanceId == "<MessageId from Partner>"
| where ActivityId == "<ActivityId>"
| project env_time, AccountId, UserId, DeviceId, ComponentName, ActivityId,
          RelatedActivityId, ApplicationName, EventUniqueName,
          ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```

## Important Notes

- **HeartBeat != Compliance**: Partner sending HeartBeat does not mean compliance status is actually provided
- Partner provides `scenarioInstanceId` (== MessageId) for tracing
- The PATCH to `graph.windows.net/.../devices/deviceId_xxx` writes `isCompliant`, `isManaged`, `deviceManagementAppId`
- `complianceExpiryTime: null` means no expiry set by partner
- Check `ComplianceDetail-ComplianceCalculator-FinalSummaryDetails` events for actual compliance evaluation results
- Look for `RequireUserExistence` and `RequireDeviceCompliancePolicyAssigned` rules in compliance detail
