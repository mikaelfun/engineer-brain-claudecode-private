# macOS Shell Script Troubleshooting (Intune)

## Source
OneNote: Mooncake POD Support Notebook > Intune > MacOS TSG > Shell TS

## Kusto Queries

### 1. Check if Intune macOS Agent is installed
```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<device-id>"
| project env_time, accountId, userId, DeviceID=ActivityId, PolicyName=name,
  PolicyType=typeAndCategory, Applicability=applicablilityState,
  Compliance=reportComplianceState, EventMessage, message, TaskName
```

### 2. Check Sidecar events (requires extra cluster)
```kql
sidecarmooncakeevent
| where DeviceId == "<device-id>"
| order by EventInfo_Time asc
| project EventInfo_Time, FunctionName, MessageText, LogLevel, FileName,
  ColumnMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, DeviceInfo_OsVersion
```
> Note: Requires adding Sidecar Mooncake cluster in Kusto Explorer

### 3. Check shell script execution result
```kql
IntuneEvent
| where env_time >= datetime('YYYY-MM-DD HH:MM:SS') and env_time <= datetime('YYYY-MM-DD HH:MM:SS')
| where DeviceId == "<device-id>"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| project env_time, ActivityId, RelatedActivityId, EventUniqueName,
  ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```

### 4. Check specific policy script results across tenant
```kql
IntuneEvent
| where env_time >= ago(2d)
| where AccountId == "<tenant-id>"
| where Col5 == "ShellScriptResult" or Col4 == "ShellScript"
| where ActivityId == "<device-id>"
| project env_time, DeviceId, RelatedActivityId, EventUniqueName,
  ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| summarize DeviceCount = dcount(DeviceId) by policyId=Col4,
  bin(env_time, 8h), Col5, ShellScriptResult=Col6
| order by bin(env_time, 8h), DeviceCount, Col5, ShellScriptResult
```

## Key Log Files on Device
| Log | Path |
|-----|------|
| MDM Daemon | `/Library/Logs/Microsoft/Intune/IntuneMDMDaemon*.log` |
| Company Portal | `~/Library/Logs/Company Portal/com.microsoft.CompanyPortalMac*.log` |
| Install log | `/private/var/log/install.log` or `/var/log/install.log` |
| Console.app | Filter on `downloadd` to check agent install |

## Common Issues
1. Mac scripting requires Intune MDM Agent (Company Portal must be installed)
2. Multiple scripts run in parallel as separate processes
3. "Run as signed-in user" scripts run for ALL currently signed-in user accounts
4. Root privileges required for changes standard user cannot make
5. Scripts attempt to run more frequently than configured if: disk full, storage location tampered, local cache deleted, Mac restarts
6. MDM check-in differs from agent check-in (agent every 8 hours)
7. Periodic scripts only report status on first run
8. Agent telemetry controlled by Mac Company Portal "usage data collection" preference

## Useful Resources
- [IntuneMacODC log collector](https://github.com/markstan/IntuneMacODC)
- [Sample shell scripts for Intune](https://github.com/microsoft/shell-intune-samples)

## Related
- intune-onenote-297: Shell script reports Error but actually ran successfully
- intune-onenote-313: Sidecar/Agent workflow overview
