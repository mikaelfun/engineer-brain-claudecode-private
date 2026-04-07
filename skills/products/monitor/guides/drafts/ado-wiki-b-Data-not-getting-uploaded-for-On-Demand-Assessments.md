---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/On-Demand Assessments/Data is not getting uploaded for On-Demand Assessments"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FOn-Demand%20Assessments%2FData%20is%20not%20getting%20uploaded%20for%20On-Demand%20Assessments"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scenario
In this section, we are specifically talking about the Free solutions in OMS and how to troubleshoot the problem when the customers mention that it has been a few days or weeks and the data is not getting uploaded to OMS portal.

_Which solution are you troubleshooting?_
This article can be used to troubleshoot these solutions
1. SQL Assessment
1. AD Assessment
1. AD Replication Status
1. SCOM assessment
[Optimize your environment with the System Center Operations Manager Health Check (Preview) solution](https://docs.microsoft.com/azure/azure-monitor/insights/scom-assessment)
 To check if a proper connection was established, look for this data source on the Log Analytics: SCOMAssessmentRecommendationRecommendation

_Facts_:
1. The AD and SQL Assessment solution runs every 7 days
1. ADReplication solution runs every 5 days
1. The solution can take as little as 15-20 mins to run. The time should not exceed 4 hours
1. These solutions require .NET Framework 4.0 or higher to be installed on the target machine

There are various customer issues we have received so far and 80% of the cases fall in the below category

## Issue 1 - Pre-requisite Failure

## Issue 2 - Free tier limit reached

## Issue 3 - Connectivity Issues

## Issue 4 - Assessment Run Reported Success

# Reference

## Additional troubleshooting
### Query execution

```
Operation
| where Solution == "ADAssessmentPlus"
| summarize arg_max(TimeGenerated, *) by Computer, OperationCategory, Detail
| sort by TimeGenerated desc , OperationStatus asc
```

### Assessment ID in Log files

Available Log files for assessmentID:

```
dir /s *{assessmentId}*
```

File types:
- processed.prerequisites.{id}.assessmentadrecs
- processed.processingmodel.{id}.ad.assessmentpm
- processed.rawdata.{id}.assessmentadrawdata
- processed.recommendations.{id}.assessmentadrecs
- processed.trace.{id}.adassessment.assessmenttrace

### Backend Telemetry check

Execute on Kusto cluster: https://omsgenevainmemprod.eastus.kusto.windows.net/OperationInsights_InMem_PROD

```kusto
//check if there is data available in In-MEM to be sent to Kusto
ActivityCompletedEvent
| union ActivityFailedEvent
| where TIMESTAMP > ago(24h)
| where activityName == "EventhubMonitor"
| parse properties with * "CustomerId=[" customerId "]" * "DataTypeId=[" dataTypeId "]" * "RowsProcessed=[" rows:long "]" *
| where customerId == "{WorkspaceID}"
| where dataTypeId contains "AD_ASSESSMENT_RECOMMENDATION_BLOB"
| summarize count(), sum(rows) by dataTypeId
```

### Confirm if any recommendations are available in the workspace

```kusto
ADAssessmentRecommendation
| where TimeGenerated >ago(7d)
| project TimeGenerated, AssessmentId, AssessmentName, FocusArea, Recommendation, Description
```

## How to: Force on OnDemand Assessment

See dedicated page for registry workaround to force immediate re-run.

## Troubleshooting Script
[Microsoft Download - Troubleshooting Script](https://www.microsoft.com/download/details.aspx?id=58089)

## FAQ

**Q:** Can the assessment machine (data collector) be a domain controller 2016 R2?
**A:** Our preference is the data collection machine be a member rather than a DC. However, a DC is supported.

**Q:** For running AD assessment as an enterprise admin — if using a service account, where does it need to be a member of?
**A:** The user account is expected to be a member of Enterprise Admins. This group needs to be a member of the built-in Admins group in each domain. The account also needs log on as a batch job right since assessment runs as a scheduled task. Managed service accounts are not yet supported.

**Q:** Does the report account need to be Enterprise Admin? Domain admin worked for a single-domain forest.
**A:** If you have more than 1 domain in the forest, Enterprise Admin is needed due to default WMI permissions on all DCs in the forest. If only 1 domain, Domain Admin will likely work.
