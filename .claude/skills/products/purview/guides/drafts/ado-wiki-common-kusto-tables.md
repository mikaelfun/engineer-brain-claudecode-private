---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Kusto Queries/Common Kusto Tables"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Tools/Kusto%20Queries/Common%20Kusto%20Tables"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Common Kusto Tables:**

Sharing below the list of common kusto tables we use in Purview for investigation:

|**Table**|**Description**|
|--|--|
|**babylonMdsLogs**|ResourceProvider, Gateway Scanning Service, Tier etc.|
|**DataScanLogs**|Data Scan logs, handled agent logs|
|**MultiCloud**|AWS S3 scanning, handled by AEP teams|
|**ScanningLog**|Any scanning related issues - scan failed, scan not started etc.|
|**ScanningAuditEvent**|All requests that come to the scanning service and the response code. For instance it will show that a user requested to create an account, however it returned a 500 because a dependent service was down.|
|**ScanningJobEvent**|When a scan is running this is where the monitoring, starting, etc logs are.|
|**ReportingLog**|scan tab, reporting tab related issues|
|**OnlineTierDetails**|Data Map logs, anything we insert into Data Map|
|**ProjectBabylonLogEvent**|RP logs/calls to partner service (reporting service, scanning service) failures, quota service exceeded information|
|**GatewayEvent**|After provisioning all user calls will be routed from gateway event, add scan, perform scan etc.|
|**BabylonIngestionConfigEvent**|common tier logs, resource sets etc.|
|**ColdTierPipelineAzureFunctionEvent**|Azure Function logs.|
|**CustomLogEvent**|Copy activity scenarios, credential issues|
