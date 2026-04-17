---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Correlate InMem telemetry with OBO telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Correlate%20InMem%20telemetry%20with%20OBO%20telemetry"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
In a few very specific scenarios, it may be needed to correlate resource logs ingestion backward in the ingestion pipeline, back to OBO telemetry.

# Pre-requisites
---
To be able to run the Kusto queries mentioned bellow, you'll need access to the relevant Kusto database/cluster, so please follow the procedure described in [How-To: Connect to Log Analytics Kusto clusters](/Log-Analytics/How%2DTo-Guides/Kusto-Data/How%2DTo:-Connect-to-Log-Analytics-Kusto-clusters).

To be able to run the Jarvis queries mentioned bellow, you'll need access to the relevant namespace, so please follow the procedure described in
[HT: Get access to ODS telemetry namespace in Jarvis](/Log-Analytics/How%2DTo-Guides/Jarvis/HT:-Get-access-to-ODS-telemetry-namespace-in-Jarvis)

# Step 1 - Get the Context from InMeM
---
The first piece of information you need is the '**context**' value from the InMem telemetry. Most of the InMem queries present on the wiki already have this column in their output, but if it doesn't, then you simply can add it to query.
Please note that while not mandatory, it's always advisable to get the value of '**Environment**' as well, as we can use it as a filter to reduce the result set and prevent query timeouts.

One example that you can use as a reference: [HT: Check for Invalid Data Format in AzureDiagnostics data ingestion process](/Log-Analytics/How%2DTo-Guides/Ingestion/HT:-Check-for-Invalid-Data-Format-in-AzureDiagnostics-data-ingestion-process)

![image.png](/.attachments/image-b8a1a6e9-fee5-43be-8dcd-357da6816616.png)

For the next step, please note the values of:
- TIMESTAMP (1)
- Environment (4)
- context (5)

# Step 2 - Get the OBO CorrelationID 
---
Now that we have the **context** value from InMem, the next step is to use ODS telemetry, to get the OBO Correlation ID.

<!--- (Old Jarvis Link: https://portal.microsoftgeneva.com/s/F82544E5) Updated below to include a space in the query hat was causing the RequestId to be extracted incorrectly when there was also a NorthStarRequestId in the properties field-->
Jarvis Link: https://portal.microsoftgeneva.com/s/B4B55BD9

Parameters:
1 - Time range: please use the TIMESTAMP value you got from the previous step
2 - Environment: please use the Environment value you got from the previous step
3 - Context: please use the Context value you got from the previous step
4 - Client Query Used:
`source`
`| extend DataType = extract(@"Log-Type:([^]\;]*)", 1, properties)`
`| extend ResourceId = extract(@"x-ms-AzureResourceId:([^]\;]*)", 1, properties)`
`| extend OBOcorrelationId = extract(@"RequestId=\[([^]\;]*)", 1, properties)`
`| project TIMESTAMP, DataType, ResourceId, OBOcorrelationId`


![image.png](/.attachments/image-ca464596-772d-4adb-b02e-e036f64b4880.png)

In the output, you'll get the OBO correlation ID, that you can then use on OBO telemetry: [How OnBehalfOf (aka OBO or Shoebox) works](/Monitoring-Essentials/Diagnostic-Settings/Concepts/How-OnBehalfOf-\(aka-OBO-or-Shoebox\)-works)

| ![image.png](/.attachments/image-71965820-0614-4e7e-82ba-50bfa833b0da.png) |
|--|