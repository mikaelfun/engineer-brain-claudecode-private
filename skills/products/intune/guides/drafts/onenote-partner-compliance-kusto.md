# Partner Compliance Kusto Troubleshooting

> Source: MCVKB/Intune/Partner Compliance.md
> Quality: guide-draft (pending SYNTHESIZE)

## Overview

How to troubleshoot third-party MDM partner compliance state synchronization with Azure AD using Kusto queries.

## Step 1: Find MessageId via GraphApiProxyLibrary

If the partner provides a MessageId, use it directly as `scenarioInstanceId`.

```kql
GraphApiProxyLibrary
| where env_cloud_name == "<cloud_name>"  // e.g. "AMSUC0101"
| where url contains "<AAD device id>"
| where contextId == '<Tenant id>'
// | where scenarioInstanceId == "<Partner Message id>"
| where responseBody contains "isCompliant"
| project env_time, url, requestBody, httpVerb, httpStatusCode, responseBody, 
          env_cloud_name, ActivityId, contextId, scenarioInstanceId, requestIds, TaskName
| order by env_time asc
```

## Step 2: Detailed Event Trace via IntuneEvent

```kql
IntuneEvent
| where env_time > ago(10d)
| where env_cloud_name == "<cloud_name>"
| where ScenarioInstanceId == "<messageId from step 1>"
| where ActivityId == "<activityId from step 1>"
| project env_time, AccountId, UserId, DeviceId, ComponentName, 
          ActivityId, RelatedActivityId, ApplicationName, EventUniqueName, 
          ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```

## Key Components in Trace

| Component | Purpose |
|---|---|
| GraphHttpProxy | Graph API calls to patch device compliance |
| StatelessComplianceDetailProvider | Compliance calculation details |
| WorkplaceJoin | Device compliance patch to AAD |
| StatelessDeviceProvider | Device property sync |

## Important Notes

- **HeartBeat ≠ Compliance Report**: A successful heartbeat message from the partner does NOT mean compliance status was actually reported
- The `deviceManagementAppId` field identifies which MDM partner reported:
  - `0000000a-0000-0000-c000-000000000000` = Microsoft Intune
  - Other GUIDs = third-party partners (e.g., MobileIron, VMware, etc.)
- `isCompliant: false` with `complianceExpiryTime: null` means device is marked non-compliant with no grace period
