# Kusto Queries for Runbook Troubleshooting (Mooncake)

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Kusto > Runbook

## Cluster
- URL: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
- Database: oaasprodmc

## Key Queries

### 1. Job Status of Runbook
```kql
let subId = "<subscriptionId>";
let AccountName = "<accountName>";
let ResourceGroup = "<resourceGroup>";
let inputRunbookName = "<runbookName>";
EtwJobStatus
| where TIMESTAMP > ago(12h)
| where * has inputRunbookName 
| where accountName == AccountName
| project TIMESTAMP, EventId, Pid, Tid, OpcodeName, TaskName, EventMessage, jobId, sandboxId, runbookName, accountName, Region, StampName
```
Key fields: `TaskName` (JobStatusChangeRunning, JobStatusChangeStopped), `sandboxId`, `jobId`

### 2. Error from Runbook (Level ≤ 3)
```kql
EtwAll
| where TIMESTAMP >= datetime(...) and TIMESTAMP <= datetime(...)
| where * has "<accountId>"
| where Level <= 3
| project TIMESTAMP, Level, TaskName, EventMessage, ActivityId, Tid
| where EventMessage contains "runbookName=<runbookName>"
```

### 3. Job Failure Reason (Sandbox Join)
```kql
let JOBID = "<jobId>";
EtwJobStatus 
| where jobId == JOBID and sandboxId != "00000000-0000-0000-0000-000000000000"
| project jobId, sandboxId, runbookName
| join DrawbridgeHostV1 on $left.sandboxId == $right.ActivityId
| where EventMessage !contains "The sandboxed process attempted to open an inaccessible resource"
| project TIMESTAMP, runbookName, jobId, sandboxId, EventMessage, Level
```

### 4. Check Web Request to Runbook
```kql
EtwIncomingWebRequest
| where TIMESTAMP > ago(15d)
| where EventMessage contains "<scheduleId>"
| where EventMessage contains "Stop"
| where httpMethod != "GET"
| order by TIMESTAMP asc
```

## Applicability
- 21v (Mooncake): Yes — use oaasprodmc cluster
