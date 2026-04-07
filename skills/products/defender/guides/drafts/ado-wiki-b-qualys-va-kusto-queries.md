---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Workload Protections/Defender for Servers/[Deprecated] - Qualys VA/Qualys VA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FWorkload%20Protections%2FDefender%20for%20Servers%2F%5BDeprecated%5D%20-%20Qualys%20VA%2FQualys%20VA"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> ⚠️ **Deprecated:** Qualys built-in VA deprecated in MDC. Replaced by Defender Vulnerability Management (MDVM). These Kusto queries are for **historical investigation** of Qualys VA issues.

# Qualys VA — Kusto / Jarvis Reference Queries

## Kusto Cluster
Add to Kusto Explorer (GrayLabel): `https://AcciaAscFollower.kusto.windows.net`

## Resource Installation Details
```kusto
let CRPVMId = cluster('AcciaAscFollower.kusto.windows.net').database('CUD').ComputeUsage_Daily_V3
| where Timestamp > ago(3d)
| where Extensions has "Qualys.WindowsAgent.AzureSecurityCenter" or Extensions has "Qualys.LinuxAgent.AzureSecurityCenter"
| where ComputerName != ""
| extend azureResourceId = tolower(strcat("/subscriptions/", SubscriptionId, "/resourceGroups/", ResourceGroupName, "/providers/Microsoft.Compute/virtualMachines/", ComputerName))
| where azureResourceId contains "{resourceName}"
| distinct CRPVMId;
cluster('romelogs.kusto.windows.net').database('RomeTelemetry').GrayLabelResources
| where AzureId contains "{resourceName}"
| summarize arg_min(UploadTime, *)
| project FirstAppearedIn = UploadTime, RegionForSupportTicket = QualysEndpoint,
          GrayLabelCustomerId = QualysCustomerId, GrayLabelResourceId = QualysResourceId,
          Vm_MetaDataIdForSupportTicket = toscalar(CRPVMId)
```

## What/When/Why Qualys Provisioning Was Recommended
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time > ago(12h)
| where serviceName has "SolutionsApp"
| where message has "Build `[Preview] Vulnerability Assessment should be enabled on Virtual Machines` assessment with status code"
  and message has "{resourceName}"
| extend AssessedAs = extract("status code:([^ ]+)", 1, message)
| extend NaReason = extract("cause:([^ ]+)", 1, message)
| extend Why = iff(AssessedAs == "Healthy", "VM already provisioned", iff(AssessedAs == "OffByPolicy", "OffByPolicy", NaReason))
| order by env_time asc
| project Time=env_time, AssessedAs, Why
```

## Trace Provisioning State
```kusto
cluster('romelogs.kusto.windows.net').database('RomeTelemetry').GrayLabelResources
| where UploadTime > ago(1d)
| where SubscriptionId == "{subscriptionId}"
| where AzureId contains "{resourceName}"
```

## All Findings Sent from Qualys to a VM
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time >= ago(7d)
| where applicationName endswith "vaApp"
| where message has "QualysGrayLabelVaSubAssessmentMessageProvider"
  and message has "Completed building assessment messages for"
  and message has "{resourceId}"
| parse message with * "Completed building assessment messages for " resourceId ": Summary of " numVulnerabilities " assessments." * "VM vulnerabilities: " vulnerabilitiesQids
| project ascReportTime = env_time, resourceId, numVulnerabilities, vulnerabilitiesQids
| sort by ascReportTime desc
```

## Provision Failed Attempts
```kusto
let StateRuns = cluster('romelogs.kusto.windows.net').database('Rome3Prod').RunStateOE
| where env_time > ago(7d)
| where StateName == "GrayLabelProvisioningStateContext"
| where StateRunResult == "StepResult.CompletedWithFailure"
| where SubscriptionId == "{subscriptionId}"
| project TimeOccured = env_time, SubscriptionId, StepId, RootOperationId = tolower(RootOperationId);
let VMFailureReasons = cluster('romelogs.kusto.windows.net').database('Rome3Prod').TraceEvent
| where env_cloud_role == "VABackgroundRole"
| where env_time > ago(7d)
| where message has "TraceStateMachineFailureResult"
| extend azureResourceId = tolower(extract("VM: ([^:]+)", 1, message))
| extend OS = extract("OS: ([^\\n]+)", 1, message)
| extend Reason = extract("Reason:(.+)", 1, message)
| extend RootOperationId = tolower(extract("##([^_]+)", 1, env_cv));
StateRuns
| join kind=leftouter VMFailureReasons on RootOperationId
| project TimeOccured, SubscriptionId, FailedStep = StepId, azureResourceId, OS, Reason, RootOperationId
```

## QID Metadata Query
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time >= ago(1d)
| where applicationName endswith "vaApp"
| parse message with * "and content: " messageJson
| extend parsedContent = parse_json(messageJson)
| extend subassessments = parsedContent.Data[0].SubAssessments
| mv-expand subassessments
| extend Qid = parse_json(subassessments['Id'])
| where Qid has "<qid>"
| extend VulnerabilityName = parse_json(subassessments['Name'])
| summarize by tostring(VulnerabilityName), tostring(Qid), tostring(subassessments)
```

## Provisioning via API
```
PUT/GET/DELETE:
https://management.azure.com/subscriptions/{Subscription}/resourceGroups/{RGName}/providers/Microsoft.Compute/virtualMachines/{VmName}/providers/Microsoft.Security/serverVulnerabilityAssessments/default?api-version=2015-06-01-preview
```

## Getting VA Vulnerabilities via Azure Resource Graph (ARG)
```
securityresources
| where type == "microsoft.security/assessments/subassessments"
| where properties.additionalData.assessedResourceType == "ServerVulnerability"
```

Filter by CVE:
```
securityresources
| where type == "microsoft.security/assessments/subassessments"
| where properties.additionalData.assessedResourceType == "ServerVulnerability"
| where properties.additionalData.cve contains "CVE-2019-0552"
```
