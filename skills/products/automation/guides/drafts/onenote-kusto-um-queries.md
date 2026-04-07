# Kusto Queries for Update Management Troubleshooting (Mooncake)

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Kusto > Update Management

## Clusters

| Service | Cluster | Database |
|---------|---------|----------|
| Automation | https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn | oaasprodmc |
| AUM v2 | https://azupdatecentermc.chinaeast2.kusto.chinacloudapi.cn | azupdatecentermc |

## Key Queries

### 1. Get Automation Account ID
```kql
// cluster: oaasprodmc
let AutomationAccountName = "<accountName>";
let subID = "<subscriptionId>";
EtwSubscriptionIdAccountNameAccountId 
| where subscriptionId == subID and accountName == AutomationAccountName 
| distinct accountId, accountName
| project accountName, accountId
```

### 2. UM Enablement from VM (Hybrid Registration)
```kql
let AccoutID = "<accountId>";
EtwAll
| where TIMESTAMP > ago(1d)
| where EventMessage has "HybridRegistrationV2Controller"
| where EventMessage has "RegisterV2Async"
| where EventMessage has AccoutID
| where EventMessage contains "<vmName>"
| project TIMESTAMP, Level, EventMessage
```

### 3. Hybrid Worker Heartbeat
```kql
let aaid = "<accountId>";
let WorkerName = "<workerName>";
JRDSEtwHybridWorkerPing
| where TIMESTAMP > ago(1d)
| where isnotempty(aaid)
| where Environment == "PROD"
| where accountId == aaid
| where machineName contains WorkerName
| summarize count() by bin(TIMESTAMP, 1h), machineName, workerVersion
```

### 4. Final State of UM Jobs
```kql
let subId = "<subscriptionId>";
let AcctName = "<accountName>";
let endTime = datetime(...);
let startTime = datetime(...);
union EtwUpdateDeploymentMachineRun, EtwUpdateDeploymentRun
| where TIMESTAMP between (startTime .. endTime)
| where subscriptionId == subId and accountName == AcctName 
| extend SUCR_Parent_JobId = softwareUpdateConfigurationRunId
| extend SUCMR_Child_JobId = softwareUpdateConfigurationMachineRunId
| sort by SUCR_Parent_JobId, TIMESTAMP asc
| summarize arg_max(TIMESTAMP, *) by SUCR_Parent_JobId, SUCMR_Child_JobId
| project TIMESTAMP, softwareUpdateConfigurationName, status, SUCR_Parent_JobId, SUCMR_Child_JobId, targetComputerType, targetComputer
```

## Reference
- TSG: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logskustoclusterdetails
- Jarvis logs: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logsqueryviagenevaportal

## Applicability
- 21v (Mooncake): Yes
