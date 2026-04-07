---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Errors/Connection failed because no resources available"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/470830"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> ⚠️ **注意**: 此页面来自 Sandbox/Outdated 区域，为早期 WVD/AVD session host 不可用的排查决策树。内容可能已过期，请结合最新排查指南验证。

# Connection Failed / No Resources Available — Session Host Troubleshooting Decision Tree

## First Step

1. Verify the VM is powered on
2. Identify the activity ID from the failure
3. Query `RDInfraTrace` using the activity ID, filter to only show warnings and errors:

```kusto
// Get RDInfraTrace using Activity ID and only show errors and warnings
// [Query not fully documented in source]
```

## Decision Branches

Based on the error found in RDInfraTrace, follow the appropriate path:

### Are services running?
- Is WVD Agent service running?
- Is WVD listener working?

### Can Agent talk to Broker?
- → Agent can't talk to Broker

### Health Issue?
- → Health Checks

### When is last time broker got heartbeat from agent?
- → Agent to Broker Heartbeat

### Registration Issue?
- → INVALID_REGISTRATION_TOKEN
- → NAME_ALREADY_REGISTERED

### Agent Issue?
- → Agent Upgrade Failed
- → Agent Crashes

### Anything in logs?
- → Collecting data with WVD-Collect
- → Collect VM logs with Inspect IaaS Disk
