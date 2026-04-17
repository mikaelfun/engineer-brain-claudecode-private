# Automation Hybrid Worker TSG - Information Collection

> Source: MCVKB 16.5 | Product: automation | 21v Applicable: Yes

## Cloud Side Logs (Kusto)

**Cluster:** `https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn`
**Database:** `oaasprodmc`
**Permission:** Join security group `Redmond\OaaSKustoGovUsers` via IDweb

### 1. EtwAll Logs

```kql
let JobID = "<job id>";
let StartTime = datetime(YYYY-MM-DD HH:MM:SS);
let EndTime = datetime(YYYY-MM-DD HH:MM:SS);
EtwAll
| where TIMESTAMP between (StartTime .. EndTime)
| where * contains JobID
| project TIMESTAMP, TaskName, EventMessage, Message
| limit 10000
```

### 2. Collect Automation Account ID

```kql
let subId = "<Sub ID>";
let AccountName = "<Account name>";
EtwSubscriptionIdAccountNameAccountId
| where TIMESTAMP > ago(1d)
| where subscriptionId == subId
| where accountName == AccountName
| distinct accountId
```

### 3. Collect Hybrid Worker Machine Name & ID

```kql
let START = ago(1d);
let END = now();
let AAID = "<account ID>";
let ROWLIMIT = 100;
JRDSEtwHybridWorkerPing
| where TIMESTAMP between (START .. END)
| where accountId == AAID
| limit ROWLIMIT
| project TIMESTAMP, workerGroup, machineId, machineName, workerVersion, SourceNamespace
```

### 4. Confirm Hybrid Worker Heartbeat (Continuous String)

```kql
let START = ago(1d);
let END = now();
let AAID = "<account ID>";
let WORKERGROUP = "<work group name>";
let MACHINEID = "<machine ID>";
let ROWLIMIT = 500;
JRDSEtwHybridWorkerPing
| where TIMESTAMP between (START .. END)
| where accountId == AAID
| where workerGroup == WORKERGROUP
| where machineId == MACHINEID
| limit ROWLIMIT
| project TIMESTAMP, workerGroup, machineId, machineName, workerVersion, SourceNamespace
| summarize event_count=count() by bin(TIMESTAMP, 30s)
| render timechart
```

### 5. Confirm Heartbeat with Log Analytics Workspace

```kql
Heartbeat
| where Computer == "<computer name>"
| where TimeGenerated >= ago(1d)
| where TimeGenerated <= now()
| summarize event_count=count() by bin(TimeGenerated, 1m)
| render timechart
```

## Information Checklist (Must Collect)

- Subscription ID
- Automation Account Name
- Automation Account ID
- Hybrid Worker Group Name
- Machine Name and Machine ID
- Job ID
- Automation Account Region
- Windows/Linux machine - Microsoft Monitoring Agent version
- Time zone of the hybrid worker
- Linked Log Analytics workspace name and ID

## On-prem Side Logs

### Agent Connectivity Issues

Check when:
- No pings in `JRDSEtwHybridWorkerPing` table in Kusto
- Registration failures logged in EtwAll logs

Docs:
- [Agent Windows troubleshoot - connectivity](https://docs.azure.cn/zh-cn/azure-monitor/platform/agent-windows-troubleshoot#connectivity-issues)
- [Hybrid worker network planning](https://docs.azure.cn/zh-cn/automation/automation-hybrid-runbook-worker#network-planning)

### Windows Servers

Collect AMALogs: run [Collect-AMALogs.ps1](https://www.powershellgallery.com/packages/Collect-AMALogs/1.0.0.2/Content/Collect-AMALogs.ps1) with elevated PowerShell. Output: `C:\CaseLogs\Caselogs-xxxxxx.zip`

### Linux Servers

Collect `worker.log` from `/home/nxautomation/run` folder.

## References

- [Azure Automation Supportability Wiki](https://supportability.visualstudio.com/AzureAutomation)
- [Troubleshooting Guide Hybrid Workers](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/292855/Troubleshooting-Guide-Hybrid-workers)
