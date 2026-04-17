---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Kusto Query Bank"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Kusto%20Query%20Bank"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scanning Kusto Query Bank

## Tables (+ important logs)

| Name | Description |
|------|-------------|
| ScanningLog | A catch all log for most logs. Generally a good place to start. |
| ScanningAuditEvent | All requests that come to the scanning service and the response code. Shows user requests and errors (e.g., 500 from dependent service). |
| ScanningJobEvent | When a scan is running this is where the monitoring, starting, etc logs are. |

## Scenario: Scan is failing, customer doesn't know why

Goal: Find the ADF pipeline RunId from the customer provided scan Id. The run Id is prefixed with "ADF Pipeline RunId".

```kql
ScanningLog
| where * contains "<customer_scan_result_id>"
```

## Scenario: Find the ADF pipeline id given a runID from the UI

```kql
ScanningLog 
| where Message contains "<id_of_scan_customer_has_provided>"
```

Result contains: PipelineId (yellow), ADF Pipeline (red), Internal Tracking Status Jobs (green).

## Scenario: A deployment failed because the scanning service failed

Option 1:
```kql
ScanningLog | where CorrelationId = "<id>"
```

Option 2:
```kql
ScanningLog | where Message contains "<account_name_that_failed>"
```

Then get the correlation IDs to see what happened.

## Find the SHIR Report ID

```kql
let runId = "<scan_run_id>";
let reg = "the data scan activities are: \\[\"([0-9a-z-]+)\"";
let firstActivityId = toscalar(
  cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
  | where Message has runId
  | where Message matches regex reg
  | take 1
  | project AccountId=extract(reg, 1, Message)
);
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where LocalMessage contains firstActivityId
| take 1
| project UserReportId
```

## Find Data Scan Logs using SHIR Report ID

```kql
let reportId = "<report_id>";
let reg = @"message: (.*)";
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == reportId
| where LocalMessage matches regex reg
| project TIMESTAMP, Msg = extract(reg, 1, LocalMessage)
```
