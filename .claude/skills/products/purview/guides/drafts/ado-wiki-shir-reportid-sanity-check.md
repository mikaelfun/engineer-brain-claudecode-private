---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/How to capture logs & traces/Get valid SHIR ReportId(s) and ActivitityId by sanity check through scanResultId"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FHow%20to%20capture%20logs%20%26%20traces%2FGet%20valid%20SHIR%20ReportId(s)%20and%20ActivitityId%20by%20sanity%20check%20through%20scanResultId"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SHIR ReportId Sanity Check via scanResultId

## Background
Uploaded SHIR logs might not contain related scan data, and logs for a scan can be split across different reports. Sanity check is essential BEFORE submitting info to ICM.

## Before Sanity Check (Optional)
Have customer upload SHIR logs, rerun the scan, upload logs again. Use latest reportId and scanResultId.

## Step 1: Validate reportId
1. Get ADF activityId for the scan run (see TSG: Get-all-ADF-datascan-activityIds-for-a-scan-run)
2. Find reportId by activityId from Kusto:
```kql
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where LocalMessage contains <activityId>
| summarize by UserReportId
```
3. Verify UserReportId matches the given reportId

## Step 2: Verify reportId has all logs
```kql
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where UserReportId == <reportId>
| where LocalMessage has "Integration Runtime node event" or LocalMessage has "Integration Runtime node event logs have been uploaded to Microsoft with ReportId"
| project LocalMessage
```
If a separate reportId appears, repeat Step 2 with the new reportId until no more sub-reportIds are found.

## Step 3: Collect all reportIds
- One master reportId + one/multiple sub reportIds
- **PASS**: If logs exist → valid reportId, submit scanResultId + all reportIds to ICM
- **FAIL**: Logs incomplete → follow steps to re-upload

### Steps to Upload Complete SHIR Logs
1. On customer SHIR machine: Computer Management > Event Viewer > Applications and Services Logs
2. Right-click "Connectors-Integration Runtime" > Properties
3. Select "Do not overwrite events (clear logs manually)" > increase max log size > Apply
4. Click "Clear Log" before rerunning scan
5. Repeat for "Integration Runtime"
6. Rerun scan, upload logs, repeat sanity check

## Step 4: Query Exceptions (Optional)
```kql
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where UserReportId == reportId
| where LocalMessage contains <activityId>
| project LocalTimestamp, LocalMessage, ActivityId
```
