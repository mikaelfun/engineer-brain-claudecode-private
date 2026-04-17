---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Concepts/Diagnostic Settings and Region Failovers"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Concepts/Diagnostic%20Settings%20and%20Region%20Failovers"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

There are two kinds of failover scenarios that may be encountered: failover of the destination resource, and failover of the source. 

The reason these scenarios come up are due to the source/destination region limitation pertaining to Storage Accounts and Event Hubs.

Destination Limitations: (https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings#destination-limitations)

&nbsp;


# Destination Failover
---

In a failover of the destination resource, data is being written to a Storage Account or Event Hub in Region A, from a Resource in Region A. 
After for example the destination fails over to a Storage Account and the data is now being written to Region B, the source is still Region A.

This would normally appear to incur a region mismatch, and the data should not allowed to be written in this manner.

However, the Storage RP has a mechanism for which data written to the Storage Account in Region A is thereafter routed to the Storage Account in Region B, and so the data is still written successfully (some data loss may occur during changeover). 

Storage Documentation on Initiating Failovers: (https://learn.microsoft.com/azure/storage/common/storage-initiate-account-failover?tabs=azure-portal) 

Diagnostic Settings do not perform any special function in this kind of failover.

&nbsp;


# Source Failover
---
In a failover of the source resource, data is being written to a Storage Account or Event Hub in Region A, from a Resource in Region A.
After the source resource fails over to a new Region B, the data is now being written from Region B to the destination Storage Account in Region A. 

This too would normally appear to incur a region mismatch, and the data should not allowed to be written in this manner.

However, Diagnostic Settings will still cover this data transfer in the event of the failover. 
Although we try not to do cross region data transfer here, we don't block it when the data arrives from the "wrong" region in a failover scenerio.

