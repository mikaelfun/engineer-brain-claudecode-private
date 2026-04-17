---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Quick Kusto Library/Quick kusto library (Classic)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FQuick%20Kusto%20Library%2FQuick%20kusto%20library%20%28Classic%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Authors: Tiffany Fischer And  UshaSri Pareddy
        

#Overview:

This below Kusto queries will help of us to find the logs by using the customer provided scan run ID information.

#Provisioning:
Azure Purview - Purview Troubleshoot Provisioning Logs review (similar to ADF). Two main reasons for provisioning issues are:

- Provider not Registered (TSG 1)
- Policy Restrictions (TSG 2)

## Provisioning State
the below query will help us to check the purview account is provisioned or not and also for checking the Capacity units.

```
// Provisioning State
cluster('babylon.eastus2').database('babylonMdsLogs').AccountInfoSnapshotEvent
| where SubscriptionId == '{SubscriptionId}'
| where ProvisioningState != 'Succeeded'
| where ResourceId == '{ResourceURI}'
| distinct ProvisioningState
// capacity units 
// Check for Policy Errors

```
## Review Resource Provider errors
When resources like storage account, event hubs and purview account not registered then the below query will help us to find those errors. 
If there are any errors returned, ask customer to confirm the necessary resource providers are registered.

```
cluster('babylon.eastus2').database('babylonMdsLogs').ProjectBabylonLogEvent
| where * contains '{ResourceName}'
| where * contains '{SubscriptionId}' // Purview Subscription
| where * contains 'Unauthorized' or * contains 'StatusCode:4' or * contains 'StatusCode:5' or * == 'Error' or * contains "OnException"
| project  PreciseTimeStamp, AccountName, Message, StackTrace, ErrorMessage, TracingLevel

```
## Deny Policy
Below Query help to find what are the policies denied to creating the Purview account

```
cluster('babylon.eastus2').database('babylonMdsLogs').ProjectBabylonLogEvent  
| where * contains ""  // Purview Account Name
| where Message contains "policy" and Message contains "deny"

```

## Gateway
All processes operations are recorded in the Gateway logs.
You can see if there are too many or some bad API requests
```
cluster('babylon.eastus2').database('babylonMdsLogs').GatewayEvent
| where AccountName =~ '{PurviewAccountName}' // or search for the RequestId 
//| where * contains '{SubscriptionId}'
| where ['time']  >= now(-6d) // use a number that will capture the time the issue occurred
| where Status >= 300 // catch all unhealthy responses
| summarize count() by bin(TIMESTAMP, 1d), Status  //operationName
```

##Lineage
```
OnlineTierDetails
| where CatalogId == "{Purview ID}"
| where ['time'] >= ago(10d) //date time
| where Msg contains "{asset name}" 
//| where Msg contains "Generating "  -- this is for asset creation filter
| project ['time'], PodName, RequestId, Msg

OnlineTierWebRequests
| where RequestId startswith "{RequestId}"
```

##Workflow
You can see if the workflow is making too many offline requests.
```
OnlineTierWebRequests
| where RequestId startswith "{RequestId}"
|where Status == "408"
```

#Data Scan Review:

##Query to check the scan level

```
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == '{ScanRunID}'
| where Message contains "scanlevel"

```
##Check IR Type

```
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == '{ScanRunID}'
| where Message contains "IRType:"
```

##Preliminary Search for errors

It will give the output with basic errors.
ScanningLog table: It will help to find SHIR version and type of scan (Full/Incremental).
Enqueued: The specific message contains the word Enqueued has the Purview account Id, the purview account Id is equal to the ADF Id and the ADF account id is equal to the Purview-accountId.
```
// Message containing 'Enqueud' has accountId. ADF Id == accountId. ADF Name == Purview-accountId
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where AccountId == '{AccountID}'
| where ScanResultId == '{ScanRunID}'
| where * contains 'failed' or * contains 'Warning' or * contains 'Error' or * contains 'Throttle' or * contains 'Unsupported' 
| order by ['time']

```

##Scan Status and Results
This can be particularly helpful if you want to check if anything was not ingested and what the status of the scan is.
```
cluster('babylon.eastus2').database('babylonMdsLogs').CustomerFacingEvent
| project ['time'], operationName, resultType, properties
| extend scan_info = parse_json(properties)
| project
    ['time'],
    isK8s = tostring(scan_info["scanType"]),
    DataSourceType = tostring(scan_info["dataSourceType"]),
    DataSourceName = tostring(scan_info["dataSourceName"]),
    ScanName = tostring(scan_info["scanName"]),
    ScanResultId = tostring(scan_info["scanResultId"]),
    resultType,
    runType = tostring(scan_info["runType"]),
    scanTotalRunTimeInMinutes = toint(scan_info["scanTotalRunTimeInSeconds"])/60,
    scanQueueTimeInSeconds = toint(scan_info["scanQueueTimeInSeconds"]),
    assetsDiscovered = toint(scan_info["assetsDiscovered"]),
    assetsClassified = toint(scan_info["assetsClassified"])
| where ScanResultId == "{ScanResultID}"
```

# Azure IR or Managed IR

##DataScan Health

We have to add Kusto cluster and database to the query. Find the Cluster Name based on Customer Purview Account Region [here](https://eng.ms/docs/cloud-ai-platform/digital-transformation-platform/azure-data-governance/governance/azure-purview/azure-data-purview-troubleshooting-guides/regionexpansion/kustoclusterdetails)

This Query will find errors during the DataScan discovery and ingestion.

Note: while using Azure IR if we are not seeing any results please use the DataScanAgentLinuxEvent table in place of DataScanAgentEvent table.


```
// DataScan Health 1 (new cluster table)
cluster('{kustoCluster}').database('DataScanLogs').DataScanAgentLinuxEvent 
| where ScanResultId == '{scanResultID}' 
| where Message contains "syntax error" or Message contains " unexpected " or Message contains "failed " or Message contains "terminated "  or Message contains "unsupported " or Message contains "exception " or Message contains "memory" or Level == "1" or Level == "2" or Level == "3" 
// Level 1 = Critical, 2 = Error, 3 = Warning, 
```

```
// DataScan Health 2 (old cluster table)
cluster('{kustoCluster}').database('DataScanLogs').DataScanAgentEvent
| where ScanResultId == '{scanResultID}' 
| where Message contains "syntax error" or Message contains " unexpected " or Message contains "failed " or Message contains "terminated "  or Message contains "unsupported " or Message contains "exception " or Message contains "memory" or TracingLevel == "Critical" or TracingLevel == "Error" or TracingLevel == "Warning"
```

##Investigate Schema / Asset / Asset classification
OpInfo - It will contain Schema also contain classification rules, asset's fully qualified domain name (FQDN)

```
// DataScan OpInfo to investigate any Schema
cluster('{kustoCluster}').database('DataScanLogs').DataScanAgentEvent/DataScanAgentLinuxEvent 
| where ScanResultId == '{ScanRunID}'
| where Message contains 'Schema":[{' // has asset name and schema
| order by ['env_time']

```
 
```
// DataScan OpInfo to investigate Schema for Specific Asset
cluster('{kustoCluster}').database('DataScanLogs').DataScanAgentEvent/DataScanAgentLinuxEvent
| where ScanResultId == '{ScanRunID}'
| where Message contains 'Schema":[{' // has asset name and schema
| where Message contains '{AssetName}' // name of file of asset or Database name
| order by ['env_time']
```

```
// If errors found in Scanning Log that may be related to ADF, check the CustomLogEvent
cluster('azuredmprod').database('AzureDataMovement').CustomLogEvent 
| where subscriptionId =~ '{SubscriptionId}'
| where Message contains 'purview-{AccountID}'
| where ActivityId == '{ActivityId}' // found in ADF ActivityRun logs
| where  * contains 'failed' or * contains 'Warning' or * contains 'Error' or * contains 'Throttle' or * contains 'exception'
```

# SHIR queries:

SHIR logs are stored in the cluster 'azuredmprod' and the database 'AzureDataMovement' and in the table 'TraceGatewayLocalEventLog'

These logs are containing discovery, ingestion and schema information related to the Scan run ID.

These logs also contain information about Network, driver, Authentication and Configuration related to the report Id.

##Query to check the runtime version

```
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == '{ScanRunID}'
| where Message contains "runtime version"

```
## Search for unique general errors - data scan health

This query is helpful when the scan fails or when there is no Assets discovered 

```
// Purview SHIR Logs review, scan returned no or partial data
// Check for all errors for the scan
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where LocalMessage contains 'syntax' or LocalMessage contains 'ErrorCode :' or LocalMessage contains 'failed' or LocalMessage contains 'missing' or LocalMessage contains 'terminated' or  LocalMessage contains 'Exception Info' or LocalMessage contains 'Log ID: Warning' or LocalMessage contains 'Type: ERROR' or LocalMessage contains ': FATAL' or LocalMessage contains 'unsupported'
| project PreciseTimeStamp, LocalMessage
| distinct LocalMessage
```

## Search for unique general errors related to discovery and Ingestion

This query is helpful when the scan fails or when there is no Assets discovered or ingested or there is partially completes.

```
// Purview SHIR Logs review, scan returned no or partial data
// Check for all errors for the scan
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where * contains '{ScanRunID}'
| where LocalMessage contains 'syntax' or LocalMessage contains 'ErrorCode :' or LocalMessage contains 'failed' or LocalMessage contains 'missing' or LocalMessage contains 'terminated' or  LocalMessage contains 'Exception Info' or LocalMessage contains 'Log ID: Warning' or LocalMessage contains 'Type: ERROR' or LocalMessage contains ': FATAL' or LocalMessage contains 'unsupported'
| project PreciseTimeStamp, LocalMessage
| distinct LocalMessage
```

##Search for All general errors related to discovery and ingestion

```
// Purview SHIR Logs 
// Check for details surrounding the error found...which error happened first
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where * contains '{ScanRunID}'
| where LocalMessage contains 'syntax' or LocalMessage contains 'ErrorCode :' or LocalMessage contains 'failed' or LocalMessage contains 'missing' or LocalMessage contains 'terminated' or  LocalMessage contains 'Exception Info' or LocalMessage contains 'Log ID: Warning' or LocalMessage contains 'Type: ERROR' or LocalMessage contains ': FATAL' or LocalMessage contains 'terminated'
| project PreciseTimeStamp, LocalMessage
```

## Search for Unique errors related to Network, driver, configuration and Authentication

```
// Purview SHIR Logs review, scan failed or returned no data
// If no errors reported for the scan, check for other errors reported not related to the scan
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where LocalMessage contains 'syntax' or LocalMessage contains 'ErrorCode :' or LocalMessage contains 'failed' or LocalMessage contains 'missing' or LocalMessage contains 'terminated' or  LocalMessage contains 'Exception Info' or LocalMessage contains 'Log ID: Warning' or LocalMessage contains 'Type: ERROR' or LocalMessage contains ': FATAL' or LocalMessage contains 'terminated'
| project PreciseTimeStamp, LocalMessage
| distinct LocalMessage
```

## Searching for Missing Assets or Schema

```
// Purview SHIR Logs review, missing asset
// If no errors reported for the scan, check for asset processed in the logs
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where LocalMessage contains 'pipe name=opinfos'
| where LocalMessage contains '{AssetName}'
| project PreciseTimeStamp, LocalMessage
| distinct LocalMessage
```

## Search for missing Classifications
 
```
// Purview SHIR Logs review, missing Classification
// If no errors reported for the scan and asset processed, check for classification in the logs
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where LocalMessage contains 'ClassificationConfig' // Check for Excluded, Custom, or M365
| where LocalMessage contains '{AssetName}'
| project PreciseTimeStamp, LocalMessage
| distinct LocalMessage
```

## Searching for missing Schema

```
// Purview SHIR Logs review, missing Schema
// If no errors reported for the scan and asset processed, check for Schema in the logs
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog 
| where UserReportId == '{ReportID}' // Report ID 
| where LocalMessage contains '"Schema":[{'
| where LocalMessage contains '{AssetName}'
| project PreciseTimeStamp, LocalMessage
| distinct LocalMessage
```

# Requests, Throttling Errors, REST API Errors

## Gateway Log Health 
We can use the Request Id to find when and where in the logs the error occurs. The Request ID can be found in the Browser Network Logs (har file).
```
cluster('babylon.eastus2').database('babylonMdsLogs').GatewayEvent
| where AccountName =~ "{PurviewAccountName}" //account identifying filter
//| where AccountId == '{AccountId}' //alternative account identifying filter search filter
//| where RequestId == '{RequestID}' //alternative account identifying search filter
| where Status >= 300
| where TIMESTAMP between (datetime('2023-06-12 00:00:00') .. datetime('2023-06-23 00:00:00')) // update with the timestamp of the issue
| summarize count(Status) by bin(TIMESTAMP,5m), Status 
| render timechart
```

## Get Search the Gateway for total operations 
```
cluster('babylon.eastus2').database('babylonMdsLogs').GatewayEvent
| where AccountName =~ "{PurviewAccountName}" //account identifying filter
| where Status >= 200
| where TIMESTAMP between (datetime('2023-06-12 00:00:00') .. datetime('2023-06-23 00:00:00')) // update with the timestamp of the issue
| summarize count(Status) by bin(TIMESTAMP,5m), Status 
| render timechart
```

# Insights

If there is an error, there should be a correlation id associated with the error that you can use when searching the logs. Other possible identifying columns are the Message and Purview AccountId columns.
```
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ReportingLog
| where AccountId == '{AccountID}'
| where Message contains "/PurviewTiffMSNew/"
| where CorrelationId == ''

cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ReportingError
| where CorrelationId == ''
```
