---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/[TSG] ADF and Synapse Diagnostic Settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Troubleshooting%20Guides/%5BTSG%5D%20ADF%20and%20Synapse%20Diagnostic%20Settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to Resource Log data that has not been received as expected by one or more [target destinations](https://docs.microsoft.com/azure/azure-monitor/platform/diagnostic-settings#destinations) as defined by [Diagnostic Settings](https://docs.microsoft.com/azure/azure-monitor/platform/diagnostic-settings).
  
ADF diagnostic logs scenario is unique in that the cases are typically reported from a standpoint of the customer "monitoring the monitoring system," and often without realizing it.

This means often the case is uncovering the failure rate of the entire diagnostic logs pipeline, rather than individually actionable bugs, so investigating these cases requires a big-picture scope, as well as the usual focus on details.

## Example

<details open>
<summary><b>Alert/Report for Long running jobs</b> (expand)</summary>
<div style="margin:25px">
 
The common scenario here is that a customer has an Alert or report querying for "long running" ADF or Synapse jobs.

This alert is typically a KQL query that works by identifying Run Ids that are have reported the "InProgress" or "Queued" statuses and checking if those IDs last greater than X minutes without the "Succeeded" (or "Failed") event arriving.

Logically, this alert will identify when a Run Id has begun but not finished within the allotted time-- but this alert will also notice any Run Ids where the "Succeeded" event is missing from the Log Analytics workspace for any other reason.

If a customer's ADF/Synapse instance only ends up with long-running jobs ~0.01% of the time, and the diagnostics pipeline also has ~0.01% loss over that timeframe, the alert will catch both of these.

In an example where a customer has sent 3 million records to the workspace of these Pipeline/Activity/etc Runs, this kind of rate would mean that:
*   Out of 3 million records, a third of those records were the "Succeeded" events, and then 0.01% of those "Succeeded" events took a long time to arrive and could have triggered the alert.
    *   This would total 100 records.

*   Out of 3 million records, 0.01% of those records are missing due to the pipeline not being lossless, but only 1 third of these will be noticed by the alert because the alert only looks for the "Succeeded" events.
    *   This would also total 100 records.

*   The Alert would see 200 misses of data, however:
    *   100 records represent legitimate fires of the alert, and 100 records represent false positives due to the log loss.
    *   This gives the alert a high false positive rate.

Due to this, a customer alerting on this kind of occurrence is very likely to observe the loss rate of the system as false positives in the alert structure.

How common it is for these patterns to be identified correlates with more total volume of logs the customer sends from their affected resource(s), and correlates also with how much less often they would encounter legitimate fires of the alert. (more data sent equals more alert fires, lower legitimate fires of the alerts leans the alert toward a higher false positive rate)

Note: The above is using hypothetical values and oversimplifying

</div>
</details> 

&nbsp;

# Information you will need
---
- The ARM Resource ID of the ADF or Synapse resource that is sending the data.

- The Run ID(s) of the missing record(s)

- The time window during which the issue occurred

- Details on how the customer has identified that data is not being received at the target destination(s).

&nbsp;

# Troubleshooting
---

The process to investigate these cases is largely the same as the [Diagnostic Settings TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480552/Troubleshooting-Resource-Log-data-not-being-received-by-target-destinations), but with both a big-picture scope and a focus on the individual records that are missing.

&nbsp;
  
## Big-picture/Macro scope:

  
1.  Is the customer using an alert or report like described in the example scenario above?

2.  What is the loss rate/ how many records is the customer losing?
    *   How many total records is the customer sending of the affected type?
        <i>vs</i>
    *   How many records are they identifying as missing?

Typically, if the customer is missing a substantial portion of their data, such as 1% or greater, this would be an unexpectedly high loss rate and cannot be considered the result of transient failures.

This is why we need to compare these items in a ratio-- if a customer is missing 100 records per day, but is sending 1 billion records per day, 100 missing records is not outside normal loss rate. But if the customer is missing 100 records out of only 1000 this would be cause for alarm. Best judgment is needed here to differentiate.

&nbsp;

## Individual record/Micro scope:

1.  Before diving into the complex steps, check basic options
    *   Does the workspace have a quota that can be reached?
    *   Are all other records also missing from the same period in time?
&nbsp;
2.  Here we have to get the individual blobpath(s) for some of these example missing records from the RP team.
    *   Because the ADF team has to engage with PG to get these blobpath(s), we need to try to get these right the first time.
        *   ADF CSS cannot access the necessary table-- the blobpaths need to be from the ShoeboxDiagnosticLogs table, not the SupportDiagnosticLogs table
        *   The Shoebox table has PII and so is inaccessible to CSS.
&nbsp;
    *   To retrieve this, we need from the customer the timestamps and Run IDs of some of the example missing records.
        *   Ideally to report this behavior, a customer will already have some Run Ids identified that are missing the "Succeeded" event.
        *   For these IDs, if the customer can also supply the timestamp where this Run ID _should_ have completed successfully, the RP can use that as the timerange to search within.
        *   Then, using the Run ID and the timestamp, we can build the appropriate DGREP link where the ADF PG would be able to use to start to find the record.
&nbsp;
3.  The DGREP link's parameters can be built/opened without having access to the data it attempts to query.
    *   As such, we can use the following query with the Resource ID, the Run ID, and the time range to help generate a link to where the data _should_ be, to assist the RP side.
        *   Resource ID -> the ARM URI of the ADF or Synapse resource
        *   RunId -> the GUID of the Activity/Pipeline/Integration Run being searched for

<div style="margin:25px">

```
//update the Resource URI, the Run ID, the start date, and the end date.

let resourceURI = "ResourceID_HERE";         //update this
let uniqueIdentifier = "RunID_HERE";         //update this
let start = datetime(2025-01-01 00:00:00);   //update this
let end = datetime(2025-01-02 00:00:00);     //update this
let tag = RegistrationTelemetry | where resourceId =~ resourceURI | where dataType == "Logs" | distinct firstTagValue;
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (start .. end)
| where firstTagValue in~ (tag) and serviceIdentity != "AzureResourceManager"
| where Role == "OnBehalfWorker"
| extend removespace = substring(recordCountByCategories, 0, strlen(recordCountByCategories)-1)
| extend categoriesArray = split(removespace, " ")
| mv-expand categoriesArray
| extend categoryNameOnly = substring(categoriesArray, 0, indexof(categoriesArray, "("))
| distinct eventEnvironment, eventNamespace, eventTableName, DataCategoryName=categoryNameOnly
| extend dgrepLink = strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", format_datetime(start, "yyyy-MM-dd"),"T",format_datetime(start, "HH:mm:dd"),"Z", "&offset=~30&offsetUnit=Minutes&UTC=true&ep=Diagnostics%20PROD&ns=", eventNamespace,"&en=", eventTableName,"&serverQuery=source%0A|%20where%20*%20contains%20\"", uniqueIdentifier,"\"%0A|%20extend%20bn%20=%20blob%5Fname%28%29&serverQueryType=kql&kqlClientQuery=source%0A|%20where%20*%20contains%20\"\"")
| project-reorder DataCategoryName, eventEnvironment, eventNamespace, eventTableName, dgrepLink
```
</div>

&nbsp;

4.  Once we have the blobpath(s) from the RP, we can check for errors why this record was not sent to the destination via the usual process for checking specific blobpaths, via the [Blob processing history](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/500274/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto)

&nbsp;

5. Interpreting Results
    *   Note that because we are expecting to find a failure, this Blobpath may be missing from the telemetry, and running the above queries may return no results.
        *   If this happens, please reach out via the [Swarming Channel](https://teams.microsoft.com/l/channel/19%3ae8340fd5f1784ae186e8873be02b9053%40thread.tacv2/Autoscale%252C%2520Activity%2520Logs%2520and%2520Resource%2520Logs?groupId=2fb9049b-bc9c-4cca-a900-84f22c86116c&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47).

    *   If the query does find the blobpath, check for the "isFailed" and the "failureReason" fields
        *   isFailed will return 1 if the attempt resulted in a failure
            *   failureReason will then note why the failure occurred, if it is a failure

        *   isFailed will return 0 if the write was a success
            *   If the write was a success, but the record cannot be found within the workspace, there may be an ingestion issue, or one of the previous details may be inaccurate (wrong blob, wrong ID, wrong resource, etc)


# Getting Help
---
:::template /.templates/TSG-GettingHelp-DiagnosticSettings.md
:::

If there are issues with this document or the dashboard itself appears to be displaying data incorrectly, please [let me know](https://teams.microsoft.com/l/chat/0/0?users=niconver@microsoft.com)
&nbsp; 

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::

&nbsp;

The below has been given previously as a customer-facing statement from the Diagnostic Settings PM addressing the transient loss within the diagnostics pipeline from a high level:

(The below statement **does not** exist as a stand-in to avoid troubleshooting these issues, but rather as an explanation when after troubleshooting we have not surfaced patterns of failures or errors/exceptions that can lead to actionable fixes)
  
"Azure Monitor Resource Logs are not 100% lossless. Resource Logs are based on a store and forward architecture designed to move petabytes of data per day affordably at scale. It has built-in redundancy and retries across the platform, but does not provide transactional guarantees. Transactional monitoring can reduce reliability and performance of the service being monitored, as transient logging errors would actually have to halt the upstream service when it is unable to confirm log delivery, as well as greatly increase costs. Whenever we can confirm a persistent source of data loss, our team considers it the highest priority to resolve and prevent it. However, small data losses may occur due to temporary, non-repeating service issues distributed across Azure, and not all of them can be caught."