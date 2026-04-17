# Get Intune Device ID, Policy ID, Application ID via Portal & Kusto

## From Intune Portal

### Device ID
Navigate to Intune portal → Devices → select device → URL contains the device ID.

### Policy ID
Navigate to Intune portal → Devices → Configuration Profiles → select policy → URL contains the policy ID.

### Application ID
Navigate to Intune portal → Apps → select app → URL contains the app ID.

> **Note**: Application ID differs per tenant, but App Store link and its ID are always the same. If you can't get the App Store link from customer, create the app in your test tenant to get the information.

## Kusto Query (21v)

```kusto
// Cluster: cluster('intunecn.chinanorth2.kusto.chinacloudapi.cn').database('intune')
// Intune DeviceID Enroll lookup
DeviceManagementProvider
| where env_time between(datetime(12/13/2023 08:03:12)..datetime(12/18/2023 08:03:12))
| where deviceId has '{{deviceId}}'
| where accountId has ''
| where message has ''
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory,
    Applicability=applicablilityState, Compliance=reportComplianceState,
    TaskName, EventId, EventMessage, message, tenantContextId, tenantId,
    aadDeviceId, accountContextId, accountid, accountId
// Get AAD DeviceID and AC_LogicName ID
| parse message with * 'AADDId=' AADdeviceID_Msg ',Type' *
| parse message with * 'CIId:' PolicyID_EvM '\';' *
| distinct PolicyID_EvM, AADdeviceID_Msg, DeviceID, AADTenant=accountContextId, accountId
```

## Usage
- Replace `{{deviceId}}` with the actual Intune device ID
- Adjust time range as needed
- This query correlates device enrollment with policy assignments and AAD device info
