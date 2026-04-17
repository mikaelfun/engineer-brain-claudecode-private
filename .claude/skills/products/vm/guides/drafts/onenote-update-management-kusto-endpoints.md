---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AUTOMATION/## Troubleshooting/Kusto/Update Management.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Update Management Kusto Endpoints & Diagnostic Queries

## Mooncake Kusto Endpoints

| Cluster | URL |
|---------|-----|
| AUM Center | https://azupdatecentermc.chinaeast2.kusto.chinacloudapi.cn |
| OAAS Prod | https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn |

| Database | Cluster |
|----------|---------|
| azupdatecentermc | AUM Center |
| genevasynthetics | AUM Center |
| oaasprodmc | OAAS Prod |

## Common Queries

### Get Automation Account ID
```kql
// cluster: oaasprodmc.chinanorth2.kusto.chinacloudapi.cn / database: oaasprodmc
let AutomationAccountName = "<account-name>";
let subID = "<subscription-id>";
EtwSubscriptionIdAccountNameAccountId
| where subscriptionId == subID and accountName == AutomationAccountName
| distinct accountId, accountName
| project accountName, accountId
```

### Update Management Enablement (Hybrid Worker Registration)
```kql
let AccoutID = "<account-id>";
EtwAll
| where TIMESTAMP > ago(1d)
| where EventMessage has "HybridRegistrationV2Controller"
| where EventMessage has "RegisterV2Async"
| where EventMessage has AccoutID
| project TIMESTAMP, Level, EventMessage
```

### Hybrid Worker Heartbeat
```kql
let aaid = "<account-id>";
let WorkerName = "<machine-name>";
JRDSEtwHybridWorkerPing
| where TIMESTAMP > ago(1d)
| where isnotempty(aaid)
| where Environment == "PROD"
| where accountId == aaid
| where machineName contains WorkerName
| summarize count() by bin(TIMESTAMP, 1h), machineName, workerVersion
```

### Final State of Update Deployment Jobs
```kql
let subId = "<subscription-id>";
let AcctName = "<account-name>";
let endTime = datetime(<end>);
let startTime = datetime(<start>);
union EtwUpdateDeploymentMachineRun, EtwUpdateDeploymentRun
| where TIMESTAMP between (startTime .. endTime)
| where subscriptionId == subId and accountName == AcctName
| extend SUCR_Parent_JobId = softwareUpdateConfigurationRunId
| extend SUCMR_Child_JobId = softwareUpdateConfigurationMachineRunId
| sort by SUCR_Parent_JobId, TIMESTAMP asc
| summarize arg_max(TIMESTAMP, *) by SUCR_Parent_JobId, SUCMR_Child_JobId
| project TIMESTAMP, softwareUpdateConfigurationName, status, SUCR_Parent_JobId, SUCMR_Child_JobId, targetComputerType, targetComputer
```

## TSG Reference
- https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logskustoclusterdetails
- https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logsqueryviagenevaportal
