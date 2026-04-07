---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - KQL"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20KQL"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Training sessions
|Date (DD/MM/YYYY)| Session Recording | Presenter |
|--|--|--|
|09/07/2025|[Sentinel Data Lake - KQL Experience](https://platform.qa.com/resource/sentinel-data-lake-kql-experience-1854/)|Zeinab Mokhtarian Koorabbasloo|

# Required Kusto Access
| Cluster Path | Database | Permissions |
|--|--|--|
| https://babylon.eastus2.kusto.windows.net | babylonMdsLogs | [TM-AzurePurviewCSS](https://coreidentity.microsoft.com/manage/entitlement/entitlement/tmazurepurvi-xzw2) |

# Documentation

KQL on Microsoft Sentinel data lake: [KQL and the Microsoft Sentinel data lake. (Preview) - Microsoft Security | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/graph/kql-overview)

# Overview

Microsoft Sentinel Lake is a modern, cloud-native security data lake that enables advanced analytics across all your security data. It brings together logs, alerts, and asset information into a single, unified platform, designed for scale, flexibility, and long-term retention.

Using Data lake exploration, customers can access and query data in lake using KQL. For KQL, the key features include:

# KQL interactive queries

Use Kusto Query Language (KQL) to run interactive queries directly on lake data. Analysts can:

* Investigate and respond using historical Microsoft Sentinel data: Use long-term data in the lake to gather forensic evidence, investigate an incident, detect patterns, and respond incidents.
* Enrich investigations with high-volume logs: Leverage noisy or low-fidelity data stored in the lake to add context and depth to security investigations.
* Correlate asset and logs data in lake: Query asset inventories and identity logs to connect user activity with resources and uncover broader attacks.

# KQL Jobs

* Promote data from the lake to the Analytics tier to enable incident investigation or log correlation.
* Schedule recurring jobs to enrich investigations using long-term, high-volume low-fidelity log or asset data stored only in the lake.

# User scenarios

* A user can select a connected Sentinel workspace or default workspace to view table list and schemas on the left side.
* A user can run KQL queries on selected workspaces to interactively view data in lake.
* A user can create a KQL job to promote data from lake into Analytics tier (ad-hoc or scheduled)
* A user can view jobs, job history, edit or delete a KQL job.

# Feature description

## KQL queries

* Select a workspace: user can select default, or one of the connected Sentinel workspaces. During public preview, only single workspace selection and query is supported.
* Left panel: Under schema tab user can see table list, schema and column types for selected workspace.
* New query tab: User can keep queries in separate tabs. Queries are stored in user preferences even after session is timeout.
* Query editor: KQL editor page to author or paste in KQL queries. IntelliSense works for table and schema definition.
* Time range: Query time range can be set in the query or selected via time picker. User can go back up to 12 years.
* Query results: Can show up to 30,000 rows. Users can view results, customize columns and export results. To obtain query results higher than 30,000 rows, customers must submit a KQL job.

![==image_0==.png](/.attachments/==image_0==-96610125-5ee6-4796-931c-fe4164620a22.png)

Note: Customers can also use Azure Data Explorer tool to run KQL queries from ADX.
* Endpoint for connection: [https://api.securityplatform.microsoft.com/lake/kql](https://api.securityplatform.microsoft.com/lake/kql)
* Considerations:
  * Users must include `external_table()` along with table name in query. For example: `external_table("SigninLogs") | take 5`
  * From the left nav, make sure the correct workspace is selected.
  * The same limitations apply to interactive KQL queries using ADX.

## KQL jobs

* Create job: Users can create a KQL job to run a query in an async mode and submit the results into a custom table in Analytics tier.
   * From KQL queries page: selected workspace and query in the editor will be automatically appear in the job in query editor.
   * From Jobs page: Query editor is blank.
* Target custom table: can be created within the job or pre-created (use an existing). Currently, Default workspaces cannot be selected as the target workspace.
* Time range: Query time range can be set in the query or selected via time picker. User can go back up to 12 years.
* Output schema:
  * Query must not include unsupported column name (such as columns starting with underscore.
  * TimeGenerated values will be overwritten by Log Analytics during promotion, if timestamp is older than 2 days. Customers can write original event time from TimeGenerated into a new column, e.g. `| project EventTimestamp = TimeGenerated, *`
  * All other LA standard columns are excluded during promotion:
    * TenantId
    * _TimeReceived
    * Type
    * SourceSystem
    * _ResourceId
    * _SubscriptionId
    * _ItemId
    * _BilledSize
    * _IsBillable
    * _WorkspaceId
  * Job run: Create a one-time job or edit a one-time job triggers KQL query to run immediately.
  * Scheduled jobs: frequency can be set as daily, weekly or monthly. Initial run must be set at least 30 minutes in future.

![==image_1==.png](/.attachments/==image_1==-62326c75-d91f-42d7-8c56-245c8133f815.png)

## Jobs

* View all jobs: View all existing jobs across KQL and Notebooks in the tenant.
* View job details: View job parameters in read-only mode including target table and query.
* View job run history: View previous runs. For failed runs, you can view an error message.
* Create KQL jobs: Create KQL jobs from jobs page.
* Edit a KQL job:
  * Edit job description
  * Edit query (as long as output schema is same)
  * Edit query time range
  * Change run details including convert one-time to schedule or scheduled job to one-time.
* Disable or Enable a KQL job
* Delete a KQL job: User can delete any KQL jobs if they are not in running state.
* Job status:
  * Enabled: Job is active.
  * Disabled: Job is disabled and will not run based on schedule.
*Job run status:
  * Succeeded: Job ran successfully.
  * Failed: Job failed.
  * In progress: Job is running.
  * Queued: Job has started to run, but it is queued to get allocated resources or due resource limitation.

# Prerequisites

* Tenant and workspace must be onboarded to Microsoft Sentinel data lake. Once the customer is onboarded to the Microsoft Sentinel data lakein Public Preview, they can see the following KQL features in the Defender portal depending on their permissions:
  * Microsoft Sentinel > Data lake exploration > KQL queries
  * Microsoft Sentinel > Data lake exploration > Jobs
* Permissions (Public preview):

  Microsoft Entra ID roles provide broad access across all workspaces in the data lake. Alternatively you can grant access to individual workspaces using Azure RBAC roles. Users with Azure RBAC permissions to Microsoft Sentinel workspaces can run KQL queries against those workspaces in the lake tier. For more information on roles and permissions, see[Microsoft Sentinel lake roles and permissions](https://review.learn.microsoft.com/en-us/azure/sentinel/roles#roles-and-permissions-for-the-microsoft-sentinel-data-lake-preview).

  Note: To create a new custom table via KQL job you need access to Sentinel workspace.

Note: For eligible roles, make sure user role is activated. [Activate Microsoft Entra roles in PIM - Microsoft Entra ID Governance | Microsoft Learn](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-activate-role)


# Considerations

## Consideration running KQL queries on lake

1. Make sure you select the proper workspace before running a query.
2. Executing KQL queries on the Microsoft Sentinel data lake incurs charges based on query billing meters. For more details, see [documentation link TBD].
3. Review data ingestion and table retention policy. Before setting query time range, be aware of data retention on your data lake tables and data is available for selected time range. (link to doc TBD)
4. KQL queries on Lake are generally low performant than queries on Analytics tier. Its recommended using KQL queries interactive queries only when exploration on historical data or tables stored in lake only mode is required.
5. The following KQL commands are currently supported:
    1. ".show version",
    2. ".show databases",
    3. ".show databases entities",
    4. ".show database"
6. Using out of the box or custom functions is not currently supported in KQL queries.
7. Calling external data via KQL query in Lake is not supported in public preview.
8. `Ingestion_time()` function is not currently supported on tables in lake. Lake tables are kusto external tables, therefore `ingestion_time()` function is not applicable.
9. Interactive queries may have 8 minutes timeout and 64MBof data size limit.
10. Interactive queries are limited to show up to 30,000 results. To obtain results beyond 30,000 rows, it is recommended to submit a KQL job.
11. If using Azure Data Explorer tool, Microsoft Sentinel data lake tables must be queried using `external_table()` function.
12. During public preview the scope of KQL interactive queries is single workspace.

## Considerations for KQL jobs

1. Job name must be unique across all jobs in the tenant.
2. Job name can be up to 256 characters. Including any characters except `#`.
3. TimeGenerated will be overwritten if it is older that 2 days. To preserve the original event time, we recommend writing the source timestamp to a separate column before ingestion.

    For example:

    ```
    YourTableName
    |projectEventTimestamp=TimeGenerated,*
    ```

4. The following standard columns are not supported for export. These columns will be overwritten in the destination tier during the ingestion:
    1. TenantId
    2. _TimeReceived
    3. Type
    4. SourceSystem
    5. _ResourceId
    6. _SubscriptionId
    7. _ItemId
    8. _BilledSize
    9. _IsBillable
    10. _WorkspaceId
5. Job start time must be any time in future after 30 mins.
6. You can create up to 100 jobs in the tenant.
7. You can run up to 3 concurrent jobs in the tenant.
8. KQL jobs can run for up to 1 hour.To improve execution time and reduce query costs, it is recommended to apply filters, such as time range, to limit the scope of data scanned.
9. During public preview the scope of KQL job is single workspace.
10. You can edit an existing job to change description, query (as long schema is same), schedule).
11. You can write to an existing custom table in Log Analytics to append data, as long as the schema (column name, and type match the destination table).

# Troubleshooting

## Common issues

1. Validate if the user has proper roles and permissions.
2. Make sure the correct workspace is selected before running a query or a job.
3. Refresh your browser to get the latest update of your jobs.
4. For queries in ADX use external_table() function in the query.
5. Review [troubleshooting guide and error handling](https://learn.microsoft.com/en-us/azure/sentinel/graph/kql-troubleshooting).

#Error codes

- KQL interactive queries: [https://learn.microsoft.com/en-us/azure/sentinel/graph/kql-troubleshooting#kql-query-error-messages](https://learn.microsoft.com/en-us/azure/sentinel/graph/kql-troubleshooting#kql-query-error-messages)
- KQL jobs: [Troubleshooting KQL queries for the data lake(Preview). - Microsoft Security | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/graph/kql-troubleshooting#kql-job-error-messages)

# Resource Links

Kusto cluster:[https://babylon.eastus2.kusto.windows.net/](https://babylon.eastus2.kusto.windows.net/)Database: babylonMdsLogs

[Sample Kusto query](https://portal.microsoftgeneva.com/?page=logs&be=kusto&kustoUrl=https%3A%2F%2Fbabylon.eastus2.kusto.windows.net%2F&database=babylonMdsLogs&query=H4sIAAAAAAAEAH1RXU/CMBR951fc9IWNgJkgGKczIUQDERIi40XjQ91uWMNosb0DMf54Wz42jIl9OveenttzT3MkMMQ1xWKFEZBKOSFZ7LF20O62gqvWZS9ud8JuL+x2Lto3gTsvzL+t5VaKMv1HeB0HQdj5I3wUKebCPBWG1Az1RiQ4VouHDUqqfcM2Q40wQWP4Ag/ezFZQBmwkE7UScgHDOJ7CM34UaChkpea17t6vv8E9eOVOPnCZVtQdeEfPByJGySVBFAErlkYVlLl5a64NwlLINNKY809MS0N7Kw1g/SRRhaRRGgKDsgDWPI48ECfs+kOi9QQpU3umqhx3XGauRcjOCkcNlHYeSCh5mPmr4W70E4dDdgKGtEvJMjPiVJiBStGyZ4WwKzfchbH9NJnsLHtCubLSRplpJXIZdYNgnxqpXG1Re9USvqNPbTadx8y3M0yxWnEtvtCaLlzMsM/J8+F9d5bA+f7NKswfHC6osJwCAAA=)

To diagnose failures, check:

1.  Geneva Dashboard-[MSG API Service Dashboard](https://portal.microsoftgeneva.com/dashboard/BabylonProd/Fidelis%2520Kusto%2520Service/MSG%2520Graph%2520and%2520Interative%2520TIER%2520APIs%2520Service)

# Searching for errors in Logs

## Check gateway logs

The following query can be used to find what API path and request failed in Gateway

```q
GatewayEvent
| where Message has "graph-instances" and Method == "PUT"
| extend GraphInstanceName = extract('graph-instances/([^/]+)', 1, Path)
| project ['time'], CorrelationId, Method, GraphInstanceName, Message, Status, Path
| order by ['time'] desc
```

Once you have the CorrelationId from this query, proceed directly to the FidelisKustoServiceLogEvent logs to trace the complete request flow.

## Check FidelisKustoServiceLogEvent log

### Using Correlation ID

When you receive an ICM ticket about create Graph Instance API failures, the ticket will contain a correlation ID. Using this correlation ID allows for more efficient and precise error investigation.

You can trace the entire request flow by using the correlation ID in your queries:

```q
FidelisKustoServiceLogEvent
| where CorrelationId == "{CorrelationId}"
| order by ['time'] asc
```

### Finding errors without Correlation ID by API Call

If you don't have the correlation ID initially, you can use general queries to locate the error first:

```q
let startTime= todatetime("2025-04-16T23:56:53.2900000Z");
let endTime= todatetime("2025-04-17T00:36:53.2900000Z");
FidelisKustoServiceLogEvent
| where Message startswith "Incoming HTTP Request:"
//Update Tenant to the correct azure region you want to look for
| where ['time'] > (startTime) and ['time'] < (endTime) and Tenant == "norwayeast"
| parse kind=relaxed Message with * "AccountId: " AccountId ", TenantId: " TenantId ", HttpMethod: " HttpMethod ", RequestUri:" RequestUri ", CorrelationId: " CorrelationId ", Action:" Action:string ", StatusCode:" StatusCode:int * ", Latency:" Latency:long *
// Add your own query specifications
// | where StatusCode == 500 or RequestUri has "v2/rest/query"
| project ['time'], OperationName, HttpMethod, Action, StatusCode, CorrelationId, RequestUri, Tenant, AccountId
```

Once you've identified the relevant error and obtained its correlation ID, you can then use that ID to proceed with the detailed correlation ID based query for comprehensive troubleshooting.

## Evaluating Customer Impact

Run following Kusto command for the designated time frame. To view customer impact based off API calls.

```q
let startTime= todatetime("2025-04-16T23:56:53.2900000Z");
let endTime= todatetime("2025-04-17T00:36:53.2900000Z");
FidelisKustoServiceLogEvent
| where Message startswith "Incoming HTTP Request:"
| where ['time'] > (startTime) and ['time'] < (endTime) and Tenant == "norwayeast"
| parse kind=relaxed Message with * "AccountId: " AccountId ", TenantId: " TenantId ", HttpMethod: " HttpMethod ", RequestUri:" RequestUri ", CorrelationId: " CorrelationId ", Action:" Action:string ", StatusCode:" StatusCode:int * ", Latency:" Latency:long *
// Specify details on what request calls you are interested in
// Example: | where StatusCode == 500 and tolower(HttpMethod) == tolower("post") and RequestUri has "v2/rest/query"
| summarize Count = count() by HttpMethod, RequestUri, AccountId
```

# Limits
Review [KQL on lake limits](https://learn.microsoft.com/en-us/azure/sentinel/sentinel-service-limits) explained inMicrosoft Sentinel documentation.

# Reference
[[TSG] KQL on Microsoft Sentinel data lake Public Preview.docx](https://microsoft.sharepoint.com/:w:/r/teams/SecurityPlatform/_layouts/15/Doc.aspx?sourcedoc=%7BB15F1E32-3E97-4207-AF61-A28BB80ADC25%7D&file=%5BTSG%5D%20KQL%20on%20Microsoft%20Sentinel%20data%20lake%20Public%20Preview.docx&action=default&mobileredirect=true&share=IQEyHl-xlz4HQq9hoou4CtwlATcz7LLeL5uV5DM_lZ5YG_M)

# Additional Information
---

  - **Public Documentation**
    - [Link to Microsoft Sentinel data lake descripions of errors that could occur in KQL / Jobs](https://learn.microsoft.com/azure/sentinel/datalake/kql-troubleshoot)
    - [Link to Microsoft Sentinel data lake KQL jobs](https://learn.microsoft.com/azure/sentinel/datalake/kql-jobs)
    - [Link to Microsoft Sentinel data lake KQL overview](https://learn.microsoft.com/azure/sentinel/datalake/kql-overview)
    - [Link to Microsoft Sentinel data lake KQL queries](https://learn.microsoft.com/azure/sentinel/datalake/kql-queries)
    - [Link to Microsoft Sentinel data lake manage KQL jobs](https://learn.microsoft.com/azure/sentinel/datalake/kql-manage-jobs)
---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
