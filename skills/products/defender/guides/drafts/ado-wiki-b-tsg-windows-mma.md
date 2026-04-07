---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Microsoft Monitoring Agent (MMA)/[TSG] Windows (MMA)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%2F%5BTSG%5D%20Windows%20%28MMA%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> ⚠️ **Deprecation Note:** MMA/Log Analytics agent retired August 2024. AMA deprecated Sep 1, 2024 (except SQL on Machine). MMA features deprecated Nov 2024 with extended MDC support.

# [TSG] Windows MMA Troubleshooting

## Support Boundaries
[ASC/Log Analytics Support Boundaries](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/310552/Support-Boundaries-Azure-Security-Center)

## Check Agent Status

### Azure VM (via Log Analytics Portal)
1. Go to Log Analytics workspace → Computer data sources → Virtual Machines
2. Find the machine, check status:
   - **Connected** → Fine
   - **Another workspace** → Connected to a different workspace
   - **Not connected** → No agent installed → click Connect
   - **Error** → Error on agent → click Disconnect then Connect

### On-Premises Windows VM (via Control Panel)
1. Go to Control Panel → Microsoft Monitoring Agent
2. Review agent status — errors listed here
3. Verify service running: Services → MicrosoftMonitoringAgent

### Portal (Extensions)
1. VM → Extensions
2. Verify MicrosoftMonitoringAgent extension is **Successfully provisioned** (not Unavailable)
   > *Note: Extensions don't appear if the VM is off*

## Log File Locations

### Windows VM Agent
- `C:\WindowsAzure\logs\WaAppAgent.log` — If this file doesn't exist, VM agent is not installed

### MMA Extension Logs
- `C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\`
- Ensure VM can run PowerShell scripts
- Ensure permissions on `C:\Windows\temp` haven't been changed

## Kusto Query — VM Health and Status

```kusto
let Workspaces = cluster("Romelogs").database("Prod").WorkspaceHealthMonitoringOE
| where SubscriptionId == "{SubscriptionId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by OmsWorkspaceResourceId
| project OmsWorkspaceResourceId, WorkspaceLocation = Location;
cluster("Romelogs").database("Prod").OmsHealthMonitoringOE
| where SubscriptionId == "{SubscriptionId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by VmId
| project VmId, LastHeartbeat, IsOmsExtensionInstalled, OmsExtensionVersion,
          OmsWorkspaceId, IsSecurityStandardSolutionEnabled, VmPowerState,
          OmsExtensionProvisioningStatus, ExtensionMessages
```

Key fields:
- `LastHeartbeat` — last time agent reported
- `Solutions` — if 'security' solution exists → Standard pricing tier
- `IsOmsExtensionInstalled` / `OmsExtensionProvisioningStatus`

## Heartbeat Query
```kusto
Heartbeat
| join ProtectionStatus on Computer
| where TimeGenerated between(datetime(2020-05-01 00:00:00)..datetime(2020-05-06 00:00:00))
| distinct Computer, VMUUID, Solutions, Type
| project Computer, VMUUID, Solutions, Type
```

## Networking Troubleshooting
1. Ensure machine can reach URLs on **port 443**
2. Windows connectivity test:
   ```cmd
   cd "C:\Program Files\Microsoft Monitoring Agent\Agent"
   TestCloudConnection.exe
   ```

## MMA PowerShell — Add/Remove Workspace

### Add a workspace
```powershell
$workspaceId = "<Your workspace Id>"
$workspaceKey = "<Your workspace Key>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.AddCloudWorkspace($workspaceId, $workspaceKey)
$mma.ReloadConfiguration()
```

### Remove a workspace
```powershell
$workspaceId = "<Your workspace Id>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.RemoveCloudWorkspace($workspaceId)
$mma.ReloadConfiguration()
```

## GetAgentInfo.ps1 Data Collection
```
C:\Program Files\Microsoft Monitoring Agent\Agent\GetAgentInfo.ps1
```
Select scenario:
1. Agent not reporting / heartbeat missing
2. Agent extension deployment failing
3. Agent crashing
4. Agent high CPU/memory
5. Installation/uninstallation failures
6. Custom logs issue
7. OMS Gateway issue
8. Performance counters issue

Collect the generated ZIP file and review logs.

## Reference Documentation
- https://docs.microsoft.com/en-us/azure/azure-monitor/platform/agent-windows-troubleshoot
- https://docs.microsoft.com/en-us/azure/azure-monitor/platform/vmext-troubleshoot
- https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/oms-windows
