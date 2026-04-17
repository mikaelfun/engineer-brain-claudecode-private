# AVD Session Limit Management Guide

> Source: OneNote Case Study [Ning] 2105110060000571
> Status: draft (pending SYNTHESIZE review)

## Background

AVD host pools have a `MaxSessionLimit` setting that controls how many concurrent user sessions each session host can accept. Understanding what counts as a "session" is critical for capacity planning.

## Session Counting Rules

| Session State | Counts Toward MaxSessionLimit? |
|---|---|
| Active | Yes |
| Idle | Yes (idle = subset of active) |
| Disconnected | Yes |
| Logged Off | **No** |

**Key takeaway:** Only fully logged-off sessions free up session slots. Idle and disconnected sessions still consume capacity.

## Monitoring Session Usage

### Via Log Analytics (WVDAgentHealthStatus)

```kql
WVDAgentHealthStatus
| where TimeGenerated > ago(1d)
| project TimeGenerated, SessionHostName, ActiveSessions, InactiveSessions
| order by TimeGenerated desc
```

- `ActiveSessions`: Currently active user sessions
- `InactiveSessions`: Includes both disconnected AND logged-off sessions (note: this is broader than just "consuming" sessions)

### Via PowerShell

```powershell
$sessions = Get-AzWvdUserSession -ResourceGroupName $rg -HostPoolName $pool -SessionHostName $host
$sessions | Select-Object UserPrincipalName, SessionState, CreateTime
```

## Recommended GPO Settings

Configure via **Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Session Time Limits**:

1. **Set time limit for disconnected sessions** — e.g., 2 hours
2. **Set time limit for active but idle sessions** — e.g., 30 minutes
3. **End session when time limits are reached** — Enable

## Manual Session Cleanup

```powershell
# Remove a specific user session
$CurResGroup = "YourResourceGroup"
$CurPool = "YourHostPoolName"
$SessHost = "YourSessionHostName"
$CurSessID = "3"

Remove-AzWvdUserSession -ResourceGroupName $CurResGroup `
    -HostPoolName $CurPool `
    -SessionHostName $SessHost `
    -Id $CurSessID
```

> Note: Each session host has its own session IDs. Specify the session host name when removing sessions.

## Best Practices

1. Always configure idle timeout + disconnect timeout GPOs during AVD deployment
2. Monitor `ActiveSessions` vs `MaxSessionLimit` ratio per host
3. Consider auto-scaling (scaling plans) to add hosts when session utilization is high
4. Reference: [Windows Virtual Desktop security best practices](https://docs.microsoft.com/en-us/azure/virtual-desktop/security-guide)
