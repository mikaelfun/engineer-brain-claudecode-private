# iPad Kiosk/AppLock Mode Migration Guide

> Source: Xiaohongshu iPad AppLock (Kiosk) change — OneNote
> Quality: draft | Product: intune | 21vApplicable: true

## Scenario

Migrating a fleet of iPads from one single-app (AppLock/Kiosk) mode to another (e.g., switching from TencentMeeting to a new meeting app).

## Key Challenges

1. **Sequencing**: Device MUST exit old single-app mode before new single-app profile is pushed. Pushing new profile while old one is active causes device to get stuck.
2. **Report Delay**: Intune policy deployment reports have significant delay (several hours) when removing single-app mode profiles — cannot rely on portal status alone.
3. **Distributed Devices**: Devices spread across multiple offices/meeting rooms, IT cannot physically access all devices.
4. **Rollback Safety**: Need to identify devices that failed to exit old mode and exclude them from new profile push.

## Kusto Queries (21v Intune Cluster)

Cluster: `intunecn.chinanorth2.kusto.chinacloudapi.cn` / Database: `intune`

### Check RemoveProfile (Exit Old Single-App Mode)

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where tenantId == "<TENANT_ACCOUNT_ID>"
| where message startswith "[Device] Sending" or message startswith "[Device] Received"
| where commandType == "RemoveProfile"
| extend errorChain = extract(@"ErrorChain:\s*(.*)$", 1, message)
| extend identifier = extract(@"identifier\s+(.+?)\s+with", 1, message)
| summarize
    env_time = max(env_time),
    commandType = take_anyif(commandType, isnotempty(commandType)),
    identifier = take_anyif(identifier, isnotempty(identifier)),
    commandResultStatus = take_anyif(commandResultStatus, isnotempty(commandResultStatus)),
    errorChain = take_anyif(errorChain, isnotempty(errorChain))
by ActivityId, commandUUID
| where identifier has "www.windowsintune.com.app.lock"
| project env_time, ActivityId, commandType, identifier, commandResultStatus, errorChain, commandUUID
```

### Check InstallProfile (Push New Single-App Mode)

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where tenantId == "<TENANT_ACCOUNT_ID>"
| where message startswith "[Device] Sending" or message startswith "[Device] Received"
| where commandType == "InstallProfile"
| extend errorChain = extract(@"ErrorChain:\s*(.*)$", 1, message)
| extend identifier = extract(@"identifier\s+(.+?)\s+with", 1, message)
| summarize
    env_time = max(env_time),
    commandType = take_anyif(commandType, isnotempty(commandType)),
    identifier = take_anyif(identifier, isnotempty(identifier)),
    commandResultStatus = take_anyif(commandResultStatus, isnotempty(commandResultStatus)),
    errorChain = take_anyif(errorChain, isnotempty(errorChain))
by ActivityId, commandUUID
| where * has "www.windowsintune.com.app.lock"
| project env_time, ActivityId, commandType, identifier, commandResultStatus, errorChain, commandUUID
```

## Recommended Migration Steps

1. Remove old AppLock profile assignment from device group
2. Use Kusto RemoveProfile query to verify removal status per device (don't rely on portal reports)
3. Only after confirming RemoveProfile succeeded, assign new AppLock profile
4. Use Kusto InstallProfile query to verify new profile push status
5. For devices that fail RemoveProfile, investigate individually — may need physical access to factory reset

## Notes

- Profile identifier format: `www.windowsintune.com.app.lock`
- Use `ActivityId` and `commandUUID` to correlate send/receive events
- `commandResultStatus` shows success/failure of each command
- `errorChain` contains detailed error info if failed
