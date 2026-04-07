---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Health/General/Microsoft Entra Connect Health Kusto Web UX"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Health%2FGeneral%2FMicrosoft%20Entra%20Connect%20Health%20Kusto%20Web%20UX"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This document provides information about how to access Microsoft Entra Connect Health (aka AAD Connect Health) data in Kusto Web UX and details of the data that CSS would have access to.

**Background:** Our customers are trusting us to only allow access for their data when they approve of it. As it stands today, any support personnel can access any customer data without consent from the customer and without any auditing. Hence the direct access to Geneva logs and Kusto client would be removed. All the required logs would be made available in ASC Kusto Web UX. This would also result in not loading the query results in Lens Datafreshness dashboard. Hence this document also provides a comprehensive list of all functions that can be used as an alternate to Lens dashboard queries.

**In Kusto Web UX, you can only view data for the tenant in scope of the service request.**

List of functions that display data from all ADHS clusters (union of specific table from all ADHS clusters):

- GlobalAdHealthAdoptionSummaryEvent
- GlobalAdHealthAlertStateTransitionEvent
- GlobalServiceEvents
- GlobalOperationEvents
- GlobalAgentEvents
- GlobalIIDServiceEvents
- GlobalIIDErrorEvents
- GlobalIIDSummaryEvents
- GlobalServerInformationEvents
- GlobalHealthAgentInformationEvents

## Lens Dashboard Queries

### 1. Missing Data Types due to which DataFreshness Alert is raised

```kusto
let startTime = todatetime("2021-10-05T02:00:00.000Z");
let endTime = todatetime("2021-10-05T12:00:00.000Z");
GlobalOperationEvents
| where env_time >= startTime and env_time <= endTime
| where tagId == long(812934261)
| extend TenantId = contextId
| where env_cloud_role contains "JobProcessor"
| where callerName == "GetAlertEvaluationResults"
| where additionalInfo contains "[ContextType:(ServiceMember)][Context:(Microsoft.Identity.Health.DataModels.ServiceMember)][RuleName:(DatafreshnessAlert)]"
| parse additionalInfo with * "][RuleEvaluationResult:(" MissingDataType ":" LastSeen:datetime ")]" *
| project env_time, ServiceId = serviceId, serviceMemberId, MissingDataType, serviceType, LastSeen, TenantId
| summarize (lastCheckedTime, tenantId, serviceId, lastSeen, serviceType)= argmax(env_time, TenantId, ServiceId, LastSeen, serviceType) by MissingDataType, serviceMemberId
| where (now() - lastCheckedTime) < 3h
| order by lastCheckedTime desc
```

### 2. List of datatypes that are processed by the Service

```kusto
let startTime = todatetime("2021-10-05T02:00:00.000Z");
let endTime = todatetime("2021-10-05T12:00:00.000Z");
GlobalServiceEvents
| where env_time >= startTime and env_time <= endTime
| extend TenantId = contextId
| where message contains "Updated datafreshness for service member"
| extend message = strcat(message,"]")
| parse message with * "Updated datafreshness for service member " serviceMemberId " and data type " DataType" to" UpdateDate"]"*
| extend MachineId = machineId
| project env_time,TenantId, MachineId = tostring(MachineId), message, DataType, UpdateDate, serviceType, serviceMemberId
| summarize (updateDate, env_time, tenantId, machineId, serviceType)= argmax(UpdateDate, env_time, TenantId, MachineId, serviceType) by DataType, serviceMemberId
| order by updateDate desc
```

### 3. Get errors in Insights Service running in the agent machine

```kusto
let startTime = ago(2d);
let endTime = now();
GlobalAgentEvents
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| where tenantId == "cxxxxxd"
| where serviceLevel contains "Error"
| where agentType == "Insights"
| where isnotempty(agentId)
| extend machineId = split(agentId, "_")[1]
| project env_time,tenantId, machineId = tostring(machineId), message, resultSignature, serviceType
| join kind = inner (
GlobalAdHealthAdoptionSummaryEvent
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| extend machineId = tostring(machineId), tenantId = contextId
) on $left.machineId == $right.machineId
| order by env_time desc
| project env_time, tenantId, machineId, machineName, message, resultSignature, serviceType, serviceId, serviceMemberId
```

### 4. Errors in Diagnostics service running in the agent machine

```kusto
let startTime = todatetime("2021-10-05T02:00:00.000Z");
let endTime = todatetime("2021-10-05T12:00:00.000Z");
GlobalAgentEvents
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| where serviceLevel contains "Error"
| where agentType == "Diagnostics"
| extend machineId = split(agentId, "_")[1]
| project env_time, tenantId, serviceType, serviceMemberId, machineId = tostring(machineId), agentType, fileVersion, message
```

### 5. Errors reported by Monitoring Agent Service running in the agent machine

```kusto
let startTime = ago(5h);
let endTime = now();
GlobalAgentEvents
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| where serviceLevel contains "Error"
| where agentType == "Monitoring"
| where isnotempty(agentId)
| extend MachineId = split(agentId, "_")[1]
| project env_time,tenantId, machineId = tostring(MachineId), message, serviceType
| join kind = inner (
GlobalAdHealthAdoptionSummaryEvent
| where env_time >= ago(2d)
| extend tenantId = contextId
| extend machineId = tostring(machineId)
) on $left.machineId == $right.machineId
| order by env_time desc
| project env_time, tenantId, machineId, machineName, message, serviceType, serviceId, serviceMemberId
```

### 6. Check if agent is uploading data

```kusto
let startTime = todatetime("2021-10-05T02:00:00.000Z");
let endTime = todatetime("2021-10-05T12:00:00.000Z");
GlobalAgentEvents
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| where tenantId == iif(isempty(tId), contextId, tId)
| where isnotempty(agentId)
| extend machineId = split(agentId, "_")[1]
| project env_time, tenantId, machineId = tostring(machineId), message, serviceType, serviceMemberId
| order by env_time desc
```

### 7. Insights Agent Data Upload

```kusto
let startTime = todatetime("2021-10-05T02:00:00.000Z");
let endTime = todatetime("2021-10-05T12:00:00.000Z");
GlobalAgentEvents
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| extend machineId = split(agentId, "_")[1]
| where message contains "Upload data to health service"
| parse message with * "Upload data to health service.[DataType:" DataType "][BlobUploadResult:" BlobUploadResult "][EventUploadResult:" EventUploadResult "][BlobUri:" BlobUri "][BlobUploadLatencyMs:" BlobUploadLatencyMs:int "][EventHubPath:" EventHubPath "][EventUploadLatencyMs:" EventUploadLatencyMs:int"][ErrorSummary:" ErrorSummary "][ServiceBusConnectivityMode:" ServiceBusConnectivityMode "][ExceptionType:" ExceptionType "][ExceptionMessage:" ExceptionMessage "]" *
| project env_time, tenantId, agentType, domainName, DataType, BlobUploadResult, EventUploadResult, BlobUri, BlobUploadLatencyMs, EventHubPath, EventUploadLatencyMs, ErrorSummary, ServiceBusConnectivityMode, ExceptionType, ExceptionMessage, machineId = tostring(machineId), message, serviceType
| join kind = inner (
GlobalAdHealthAdoptionSummaryEvent
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| extend machineId = tostring(machineId)
) on $left.machineId == $right.machineId
| project env_time, tenantId, machineName, machineId, agentType, domainName, DataType, BlobUploadResult, EventUploadResult, BlobUri, BlobUploadLatencyMs, EventHubPath, EventUploadLatencyMs, ErrorSummary, ServiceBusConnectivityMode, ExceptionType, ExceptionMessage, message, serviceType, serviceId, serviceMemberId
| order by env_time desc
```

### 8. Data Types as Uploaded by Monitoring Agent

```kusto
let startTime = ago(10h);
let endTime = now();
GlobalAgentEvents
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| where isnotempty(agentId)
| where message contains "AzureUploader.UploadBuffer"
| parse message with * "AzureUploader.UploadBuffer.EventHub;"dataType":"result":" *
| extend machineId = split(agentId, "_")[1]
| extend machineId = tostring(machineId)
| project env_time, tenantId, message, dataType, result, machineId, serviceType
| join kind = inner (
GlobalAdHealthAdoptionSummaryEvent
| where env_time >= startTime and env_time <= endTime
| extend tenantId = contextId
| extend machineId = tostring(machineId)
) on $left.machineId == $right.machineId
| project env_time, tenantId, machineName, machineId, dataType, result, serviceType, serviceId, serviceMemberId
| order by env_time desc
```

### 9. Check for Email Alert Activity on tenant

```kusto
GlobalOperationEvents
| where env_time >= ago(7d)
| where callerSourceInfo == "EmailNotificationClient.cs"
| project env_time, message, serviceType, callerName, additionalInfo, correlationId, internalCorrelationId
```

## Alternate functions to Lens Datafreshness dashboard queries

All the functions accept optional input parameters to specify duration. If no parameter is specified the function fetches data for last one day (except for CurrentAlertsForTenant - it fetches data for last 30 days) for the tenant specified in service request.

| Function | Optional arguments | Details |
|---|---|---|
| CurrentAlertsForTenant | period(timespan) | Current Alerts for the Tenant in scope |
| GetMissingDataTypes | start(datetime), end(datetime) | Missing Data Types due to which DataFreshness Alert is raised |
| GetDataTypesDisplayedAtServer | start(datetime), end(datetime) | Fetches the updated list of datatypes that are processed by the Service |
| CheckAgentDataUpload | start(datetime), end(datetime) | Check if agent is uploading data |
| CheckMonitoringAgentDataUpload | start(datetime), end(datetime) | Data Types as Uploaded by Monitoring Agent |
| CheckInsightAgentDataUpload | start(datetime), end(datetime) | Insights Agent Data Upload (agent version > 3.0.244.0) |
| GetErrorsReportedbyInsightsAgent | start(datetime), end(datetime) | Check for errors in Insights Service |
| GetErrorsReportedbyDiagnosticsAgent | start(datetime), end(datetime) | Check for errors in Diagnostics Agent |
| GetErrorsReportedbyMonitoringAgent | start(datetime), end(datetime) | Errors reported by Monitoring Agent Service |
