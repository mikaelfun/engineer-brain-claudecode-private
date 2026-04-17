---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Collaboration Guides/Collaborating with ADF Or Synapse for missing Logs exported through diagnostic settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Collaboration%20Guides/Collaborating%20with%20ADF%20Or%20Synapse%20for%20missing%20Logs%20exported%20through%20diagnostic%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
---
This article describes how to collaborate with the Microsoft ADF or Synapse team for the purpose of verifying that data was correctly sent to OnBehalfOf (a.k.a., OBO, Shoebox, diagnostic settings).

# Information you will need
---

- Azure ADF Resource Id.
- The type of log that is missing one or more records.  Available log categories can be found in article https://learn.microsoft.com/entra/identity/monitoring-health/howto-configure-diagnostic-settings#log-categories.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#efd9fd">
   
   **Note**
   
   If the target destination is an Azure Monitor Logs (a.k.a., Log Analytics) workspace, then the log type will be evident from the table name being queried.
   </div>

- Timestamps and correlationIds of one or more records that did not reach the target destination in the last 7 days.


# Creating the Collaboration
---
1. Populate a well-articulated problem description identifying details about the resource Id, the record(s) missing including relevant log types, timestamps and correlationIds.

1. Clearly identify that the ask of the ADF is to provide a blob path that confirms the data was sent to OBO for each missing record matching the blob paths to the timestamp and correlationId(s) provided.

   **Note**

2. While working with ADF CSS/PG, please provide them  DGREP table name from which we expect the blob paths to extracted from.
Run the below query and from the resultant dataset use the values from "eventNamespace","eventTableName" columns and share it ADF CSS/PG.

InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(2h) 
| where firstTagValue contains "" // **ADF OR Synapse resource id**
| where serviceIdentity =~"MicrosoftDatafactory" // for synapse use "Microsoft.Synapse"
| where recordCountByCategories contains "ActivityRuns" // Change this depending on the type/category of record missing
| distinct eventNamespace,eventTableName

**Sample Output**
![image.png](/.attachments/image-5e6afb08-e0f8-4168-8bb5-3170d316ae57.png)

Recording : https://microsoft-my.sharepoint.com/personal/vikamala_microsoft_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fvikamala%5Fmicrosoft%5Fcom%2FDocuments%2FRecordings%2FHow%20to%20get%20the%20blob%20paths%2Emp4&ga=1&sw=auth&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopiedShareExpControl%2Eview


# Azure Datafactory TSG

https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/434293/Log-Analytics-doesn't-show-the-ADF-data