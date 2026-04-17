---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Concepts/How OnBehalfOf (aka OBO or Shoebox) works"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Concepts/How%20OnBehalfOf%20%28aka%20OBO%20or%20Shoebox%29%20works"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Architecture
---

![image.png](/.attachments/image-b2129d7b-2236-4b25-ab77-8bcd60534ee1.png)

The above is an image overview the full processing of the �diagnostics pipeline�� from the data beginning at the Resource Provider, to the end destinations configured on a customer�s Diagnostic Setting.
At first glance this is more complicated than is required for a troubleshooting understanding for us in the CSS side, and so we have highlighted in red the 3 most prominent sections that appear in the TSGs and How-To�s written about this setup. 

# Resource Provider
---
To start, the data is originated by the Resource Provider and collected via their service-level monitoring agent (often referred to as the Geneva Agent). This data is commonly collected regardless of the existence of a Diagnostic Setting, in which cases it is just being stored in that RP�s backend rather than shipped to Shoebox. When the data is intended to be forwarded to Shoebox, that Agent will upload the blob containing all the Shoebox logs once every minute to the RP-owned storage �moniker�, and also push a message to the RP-owned Event Hub in that moniker (this is an internal Event Hub, not a customer-owned Event Hub). 

- This has the first intersection with our troubleshooting� the �InputBlobFirstTagMetadata� table we query houses the records for those blobs uploaded by the RPs. 
- In a sense, this means that table is the first stepping stone in the pipeline that we can troubleshoot. When the data is not present in the InputBlobFirstTagMetadata table, this indicates the RP did not successfully upload the blob, and this is when collaboration efforts must be directed to the RP.
- If the data is present in the InputBlobFirstTagMetadata table, the first step has been completed, and so we can continue the troubleshooting forward. 

# Normalizer
---
After the RP�s agent has pushed the data to Storage, and the message to their Event Hub, the Normalizer service listens to all the Event Hub messages and will forward any of those Shoebox messages to the Event Hub queue for Shoebox. 
Shoebox then reads the message and downloads the corresponding blob from the storage account. The blob is then unpacked into the separate logs contained within, and parsed by Resource Id. 
For each Resource Id, Shoebox checks the Diagnostic Settings store, and if a Diagnostic Setting exists, it retrieves the destinations. Shoebox then bundles the logs within that blob that match the Diagnostic Setting�s configuration, and dispatches them to the destinations. 

- The above step does not actively retrieve the Diagnostic Settings from the �RegistrationTelemetry� table, because while RegistrationTelemetry is a good information store for Diagnostic Settings, it is only updated once every 24 hours per Diagnostic Setting registration. 
- This said, our TSGs utilize the RegistrationTelemetry table because it is a pivot point to map Resource Ids to their Diagnostic Setting�s configuration details (such as the target destinations, the time created, the categories in use, the First Tag ID, etc).
Also: 
- Note here that logs may be uploaded to the RP-owned Storage blob which have datatypes (categories) that do not match the Diagnostic Setting�s configuration. These logs would reach the above mentioned step of the processing, but then not be dispatched if no Diagnostic Setting registration is configured for their category. 
- For example, a Resource may have a Diagnostic Setting configured for only category �StorageWrite�, but can still have records uploaded from the Resource Provider of categories �StorageRead�. We would see those �StorageRead� records in the InputBlobFirstTagMetadata table since they were uploaded, but those logs would not get forwarded to the end destination once Shoebox performs the checks mentioned above. 

# Telemetry
---
The logs once dispatched to their respective destinations are what matches the records we see in the Telemetry tables. 

## Storage

For customer storage account destinations, if no logs have been filed for the hour, it creates a new directory, and creates an append blob for the logs. If there is already a blob, it appends the new logs onto the end of the file, using the JSONLines format.

- StorageAccountAppendBlockTelemetry
- CustomerStorageTelemetry (old)

## Event Hub

For customer Event Hub destinations, Shoebox dispatches the message to the Event hub.

- EventHubSendBatchTelemtry
- CustomerEventHubTelemetry (old)

## Log Analytics

For customer Log Analytics destinations, Shoebox sends the logs to the Log Analytics Ingestion Endpoint (ODS), and then the LA ingestion pipeline takes over.

- OdsPostTelemetry
- ODSTelemetry (old)

In each case, these transactions can be seen in their relevant telemetry tables listed above. There are presently 6 Telemetry tables, because there are an original 3, and a more updated version of each of them. 

- Among several updates, the most notable is the older tables only populate records for successful writes, while the newer tables populate records for both successful and unsuccessful writes, distinguished via the �isFailed� field.
- Another notable difference is the newer tables include the blobpath that the written batch of logs was pulled from. This allows the record to be easily mapped to any blobpaths supplied by RPs, or other tables within Azureinsights.Insights
In Azure Support Center, under the �Diagnostic Settings� UI, the 6 tabs depicted below correspond to the above mentioned Telemetry tables. These tabs query these same tables and generate charts on the data returned. 


![image.png](/.attachments/image-9374985e-e3f7-4868-a557-50e0a44ade43.png)


# Retry queue / Secondary Worker queue
---

OBO has a retry cadence for records that were not successfully delivered on their first attempt to the destination. 

This works in a 4 total tries-- the initial write, followed by 3 retries.
The retries are after 10 minutes, then 1 hour, then 12 hours. 

Data that fails to write on the fourth attempt is dropped permanently. 


## Event Hub

Event Hubs have the above retry cadence, and also additional considerations.
- reference also: [eng.ms/docs OBO Event Hub Latency](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-health-standards/observability/azure-monitor-essentials/tsg-for-azure-monitor-essentials/troubleshooting/tsgs/obo/obo-highlatencyundereventhubs)

Event Hubs often throttle requests from OBO when the EH is underprovisioned for the data volume being sent. 

OBO then has a 'backoff' period of 5 minutes where it will avoid sending requests, as a form of self-throttling. This avoids DDOSing the Event Hub, allows the throttling to clear, and avoids expensive timeouts from the OBO service perspective. This 5 minutes of records not being sent can result in data loss-- as records directly throttled will be placed in the retry queue, but records not attempted will not be placed in the retry queue.*

Event Hub throttling has a substantial chance for data loss, and the recommendation is always to right size the Event Hub in a manner that avoids this.

Event Hubs that are significantly underprovisioned for significant enough time that they cause a noisy neighbor issue for the OBO service will result in our PG team performing blocklisting of that Event Hub. This involves the PG team directly working with CXP to communicate to the customer their Event Hub is marked as permanently unavailable by the Diagnostics pipeline, and ceases all writes from OBO to it. These customer's are then informed to engage with Microsoft Support to work on right sizing that Event Hub again, in order to re-enable the Diagnostic Settings. This is an extremely rare but possible outcome for Event Hubs that are underprovisioned to an extent that threatens OBO's service availability as a whole. 

*The 5 minutes of records not being sent can result in data loss, and can sometimes not. This is due to a singular blob containing many records for many different resources and customers. If any <i>other</i> records in that blob cause that blob to enter the retry queue, the blob will enter the retry queue as a whole, and the skipped record to the throttled Event Hub will have a chance to be sent again in the future (if the Event Hub is no longer throttled by the time of that retry).






 