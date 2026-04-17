---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Determine if an error is caused by ARM or a resource provider"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Determine if an error is caused by ARM or a resource provider"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

### 1. Locate the operation in Kusto
First step is to identify the operation being investigated in the logs. See [[TSG] Locate a specific operation in Kusto](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623816) for some tips on how to do this.

### 2. Determine if the operation is synchronous or asynchronous
Synchronous and asynchronous operations behave different in our logs. Once the operation has been identified, check [[TSG] Call processing - sync vs async](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623804) to identify which kind of operation is it and its final state from Kusto logs.

### 3. Confirm where the response is coming from
Take the activity id for the operation, if found in *HttpOutgoingRequests*, the issue is coming from the RP presented in the `hostname` column.

On asynchronous calls, the process is almost the same, but there is a small difference. Watch out for which activity id to query, as the one that should be used is the one that represents the final state of the operation in *EventServiceEntries* table.

> For asynchronous calls, *HttpOutgoingRequests* might show a 200, even if the final state of the operation is failed. This is expected as async calls return the actual failure in the response body of a check operation status call.

> There are scenarios where the hostname in *HttpOutgoingRequests* is the ARM endpoint (See [[ARCH] REST APIs - ARM endpoint](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623753/REST-APIs?anchor=arm-endpoint)). This means ARM is calling itself from a job, but it is not deterministic to say the issue is coming from ARM.
