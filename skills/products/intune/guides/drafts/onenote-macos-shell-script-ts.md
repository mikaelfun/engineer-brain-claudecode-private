# macOS Shell Script Troubleshooting via Intune (SideCar)

> Source: MCVKB/Intune/Mac/Shell TS & DMG.md, Shell TS.md
> Quality: guide-draft (pending review)

## Prerequisites

- Intune MDM Agent (Company Portal) must be installed
- Agent location: `/Library/Intune/Microsoft Intune Agent.app`

## Kusto Queries

### Check if Intune management agent is installed
```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "{deviceID}"
| project env_time, accountId, deviceName, userId, DeviceID=ActivityId,
    PolicyName=name, PolicyType=typeAndCategory,
    Applicability=applicablilityState, Compliance=reportComplianceState,
    EventMessage, message, TaskName
```

### Check shell script execution result
```kql
IntuneEvent
| where env_time >= datetime('YYYY-MM-DD HH:MM:SS') and env_time <= datetime('YYYY-MM-DD HH:MM:SS')
| where DeviceId == "{deviceId}"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| project env_time, ActivityId, RelatedActivityId, EventUniqueName,
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```

### Check tenant-wide shell script results
```kql
IntuneEvent
| where env_time >= ago(2d)
| where AccountId == "{tenantId}"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| project env_time, DeviceId, RelatedActivityId, EventUniqueName,
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| summarize DeviceCount = dcount(DeviceId) by policyId=Col4, bin(env_time, 8h), Col5, ShellScriptResult=Col6
| order by bin(env_time, 8h), DeviceCount, Col5, ShellScriptResult
```

### SideCar (21v/Mooncake) Kusto
```kql
sidecarmooncakeevent
| where DeviceId == "{deviceId}"
| order by EventInfo_Time asc
| project EventInfo_Time, FunctionName, MessageText, LogLevel, FileName,
    ColumnMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, DeviceInfo_OsVersion
```

Cluster: `https://kusto.aria.microsoft.com` (Public cloud, AAD-Federated)
Database: `IntuneMacSidecar`

## Log Collection

Collect these files from macOS device:
- `/Library/Logs/Microsoft/Intune/IntuneMDMDaemon*.log` - script running results
- `~/Library/Logs/Company Portal/com.microsoft.CompanyPortalMac*.log`
- `/private/var/log/install.log` - IME app installation + LOB app installation
- `/var/log/install.log`
- Console.app log filtered on `downloadd` - verify agent installation

## Common Issues

1. Company Portal must be installed first (Mac scripting requires Intune MDM Agent)
2. Multiple scripts run in parallel as separate processes
3. "Run as signed-in user" requires user to be signed in
4. Root privileges required for system-level changes
5. Agent checks in every 8 hours (different from MDM check-in); unhealthy state recovery every 4 hours up to 6 times
6. Scripts retry more frequently when: disk full, storage tampered, local cache deleted, Mac restarts
7. Periodic scripts only report status on first run
8. Agent removed when: scripts unassigned, device unmanaged, or irrecoverable state > 24h device-awake time

## DMG App Deployment

For DMG-based app deployment troubleshooting, check `install.log` for installation status.

## Reference

- [macOS Scripting Troubleshooting Guide (SideCar)](https://www.intunewiki.com/wiki/MacOS_Scripting_Troubleshooting_Guide_(SideCar_for_MacOS))
- [Sample shell scripts for Intune admins](https://github.com/microsoft/shell-intune-samples)
