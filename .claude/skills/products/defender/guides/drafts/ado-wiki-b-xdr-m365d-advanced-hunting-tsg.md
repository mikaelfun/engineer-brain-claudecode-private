---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Advanced Hunting/[TSG] - XDR M365D Advanced Hunting"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Advanced%20Hunting/%5BTSG%5D%20-%20XDR%20M365D%20Advanced%20Hunting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

More details and TSGs can be found in [Hunting - Overview](https://microsoft.visualstudio.com/WDATP/_wiki/wikis/WDATP.wiki/98142/Hunting).

#Feature Description 

M365D Advanced Hunting provides customers with unified portal experience to explore all data available for hunting and investigation purposes from the Sentinel workspace and Microsoft 365 Defender.

The M365D Advanced Hunting experience is intended to provide seamless migration from the Sentinel Logs experience, with all Sentinel content imported to M365D, existing Sentinel and M365D exploration capabilities maintained, and improved capabilities are added.

# User Scenarios
- A user can query all data from the Sentinel workspace and Microsoft 365 Defender
- A user can access all Logs content of the workspace, including telemetry, queries and functions, for read/query only (not edit)
- A user can save new queries, functions and Analytic Rules using data sets from Sentinel workspace and Microsoft 365 Defender

# UI description
The Advanced Hunting page is accessible from the left navigation bar in M365D portal, and contains 4 main parts:
- **Query editor**: Including query tabs and control buttons to execute, save and share queries.
- **Left panel**: Containing schema, functions, queries and detection rules sections.
- **Result set**: Containing the query results and sections for getting started and query history.
- **Right panel**: Opens on demand and can contain details panels and wizards.

![image.png](/.attachments/image-e2108b17-ea5a-415c-a913-661b8e01aed0.png)

To allow users with seamless query experience when using the M365D portal, all data sets and saved queries and functions from the Sentinel Logs experience is imported to M36D.

The imported content from Sentinel should appear for tenants that are opted in to M365D and users who are exposed to the Sentinel workload in the following parts of the Advanced Hunting page:

- **Schema**: Sentinel workspace tables are shown in the Schema panel under sections: Microsoft Sentinel, Custom Logs, Log Management, etc.
- **Queries**: Sentinel saved queries are shown in the Queries panel, under Sentinel queries folder.
- **Functions**: Sentinel functions are shown in the Functions panel, under folders: Microsoft Sentinel, Log Management and Sentinel Workspace Functions.

Sentinel content is synced to the M365 Advanced Hunting page on any load of the page, and should be updated in real-time with the content as shown in Sentinel portal. For the Preview release, saved queries and functions from Sentinel are not updateable from the M365D portal, and remain in read-only version.

![image.png](/.attachments/image-0477282e-3f47-48f7-9122-38832527678d.png)

# High-Level Architecture
To support M365D Advanced Hunting integration with Sentinel, there are 3 main integration points:
- Tenant onboarding and workspace details are fetched from the USX Core Onboarding Client.
- Query execution is done by calling the Log Analytics Query Proxy.  
- Importing schema, functions and saved queries is done by sending API calls to Log Analytics during loading of the page.

![M365D Advanced Hunting integration with Sentinel.png](/.attachments/M365D%20Advanced%20Hunting%20integration%20with%20Sentinel-72068e37-2d0f-42df-bdc0-e5451a5b61f3.png)

# TSG

## Preview Prerequisites 
Check that the tenant has the needed prerequisites for enabling M365D portal with Sentinel workload:

| Required Roles & Permissions | User with access to M365D Advanced Hunting and at least Microsoft Sentinel Reader |
|--|--|
| Clouds | US/EU/UK Clouds only |

## Permission Issues

<details open>
<summary> Issue Description: User can�t see any Sentinel content in Advanced Hunting </summary>

**Possible Causes:**
1. Tenant is not eligible or opted-in to Sentinel in M365D.
2. User is not exposed to the Sentinel workload in M365D.
3. Error in getting tenant status or user permissions.
4. Error in loading Sentinel content in Advanced Hunting.

**Troubleshooting Steps:**

1. **Check that the tenant is eligible and opted-in to Sentinel:** Run the following query to check if the tenant is eligible, configured and opted-in to MTP:

   ```q
   cluster('wcdprod').database('TenantsStoreReplica').TenantsV2
   | where AadTenantId == "{tenant_id}"
   | top 1 by ingestion_time() desc 
   | project MtpWorkloads
   | extend SentinelMtpConfigured = tobool(todynamic(MtpWorkloads).WorkloadParameters.Sentinel.MtpConfigured)
   | extend SentinelOptedIn = tobool(todynamic(MtpWorkloads).WorkloadParameters.Sentinel.OptedIn)
   | extend SentinelIsEligible = tobool(todynamic(MtpWorkloads).WorkloadParameters.Sentinel.IsEligible)
   | project SentinelMtpConfigured, SentinelOptedIn, SentinelIsEligible, MtpWorkloads
   ```

   All 3 properties should be true for the tenant to be able to see Sentinel content in M365D. In case one of the properties is false, guide the customer on getting the correct licensing and onboarding to M365D.

2. **Check that user is exposed to the Sentinel workload:** From the portal, refresh the page and open the browser dev tools. Search in the Network tab for the TenantContext API call and make sure that:

    a. `IsSentinelActive` returns true

    b. `MtpPermissions` contains non-empty permission array

    ![image.png](/.attachments/image-93f2488d-7fe9-4b73-a094-917ee63d1fdb.png)

3. **Check that the issue is specific to Advanced Hunting:** Navigate to other pages in the portal and check that Sentinel content is available. For example, make sure that the left navigation bar contains the Sentinel section and that Sentinel alerts are shown in the M365D alerts queue.

   ![image.png](/.attachments/image-7b86d021-d68a-4f8e-a59d-73e414f97b43.png)

   If Sentinel content is missing from the entire M365D portal, this indicates a wider permission or onboarding issue for the tenant or user.

4. **Check if the issue is consistent on all Sentinel content in Advanced Hunting:** If all of Sentinel content is missing from Advanced Hunting, including tables, queries and functions, this usually means that there is an issue checking the onboarding status of the tenant or permission status of the user.
   
   Run the following query to check errors in calls to the onboarding client:

   ```q
   cluster('wcdprod').database('Geneva').InETraceEvent
   | where env_time > ago(1d)
   | where AadTenantId == "{tenant_id}"
   | where service_name == "ine-huntingservice-external"
   | where Source has "UsxTenantContextProvider"
   | where LevelId < 3
   | project env_time, Message, ContextId
   ```

   If only a specific content type is missing from Advanced Hunting, continue to the next sections.

</details>

## Schema Issues

<details open>
<summary> Issue Description: Sentinel tables are not showing up in Advanced Hunting. </summary>

**Possible Causes:** 
1. The tenant or user is not eligible to the Sentinel workload in M365D.
2. Specific tables are filtered out from the Sentinel schema.
3. Error in loading Sentinel schema from Log Analytics.

**Troubleshooting Steps:**

1. **Check tenant and user eligibility to Sentinel workload:** Follow the steps mentioned above in the Permission Issues section, to make sure the tenant and user are eligible and exposed to the Sentinel workload.

2. Check if all Sentinel tables are missing or only specific ones:

   a. In case only specific Sentinel tables are missing from the Advanced Hunting schema, first check if those tables are showing in the Sentinel workspace. Those tables might be removed from the workspace and therefore will not show in Advanced Hunting as well.
   
   b. If the tables are showing in Sentinel, check the Known Issues section to make sure those tables are not filtered out intentionally from M365D.

   c. Try to execute a query on one of the missing tables. Some tables will be hidden from the Advanced Hunting schema, but will be available for querying.

3. **Check errors in loading the Sentinel schema:** Run the following query to check failures in getting the Log Analytics schema:

   ```q
   cluster('wcdprod').database('Geneva').InETraceEvent
   | where env_time > ago(1d)
   | where AadTenantId == "{tenant_id}"
   | where service_name == "ine-huntingservice-external"
   | where Source has "LogAnalyticsSchemaProvider"
   | where LevelId < 3
   | project env_time, Message, ContextId
   ```

</details>

## Query Issues

<details open>
<summary> Issue Description: Query that contains Sentinel tables or functions is failing in M365D portal. </summary>

**Possible Causes:**

1. Query is also failing from Sentinel workspace.
2. Query contains tables, functions or operators that are not supported in M365D.
3. Query is timing out or using too many resources.

**Troubleshooting Steps:**

1. **Verify that the query is working in the Sentinel workspace:** Execute the query from the Sentinel workspace and make sure it runs successfully. If the query is showing the same error in the Sentinel workspace, then the error in M365D is expected.

2. **Check unsupported tables, functions or operators:**
   
   a. Some of the tables, functions and operators available in Sentinel are not yet supported in M365D, check the Known Issues section to understand if this is the case. 

   b. Make sure to check any function used in the query and expand the function implementation, to understand if unsupported tables or operators are hidden inside of the function code.
   
   c. Try to separate the query to individual parts and run each one of them separately, to identify the specific table, function or operator that is failing. This is especially true when the query is using the join operator, try to run each part of the join separately. 

3. **Check if issue is related to resource consumption:** From the query error shown in the portal, check it indicates timeout, reaching memory or CPU limitations, or exceeding query resources. Advanced Hunting is using a CPU quota to limit excessive query usage, and there are also built-in Kusto limitations on resource consumption.  

   Run the following query to check if the query was throttled by the Advanced Hunting quota:

   ```q
   cluster('wcdprod').database('Geneva').InETraceEvent
   | where env_time > ago(1d)
   | where AadTenantId == "{tenant_id}"
   | where service_name == "ine-huntingservice-external"
   | where Message has "User-submitted query was throttled"
   | project env_time, Message, ContextId
   ```

   If the query failure is related to resource consumption, try to narrow down the lookback time of the query and reduce inefficient query operators by following the Advanced Hunting Query Best Practices.

4. **Check for errors in query execution:** Run the following query to see the full query error:

   ```q
   cluster('wcdprod').database('Geneva').HuntingKustoQueriesLog
   | where env_time > ago(1d)
   | where TenantId == "<tenant id>" 
   | where QueryOrigin == "User"
   | where DataSources has "LogAnalytics"
   | where isnotempty(ErrorCode)
   | join KustoQueriesLog on $right.ClientActivityId == $left.KustoClientRequestId
   | parse Text with * "(*);" UserQuery
   | project StartedOn, UserQuery, ErrorCode, FailureReason, DurationInMs, TotalCpu
   ```
</details>

<details open>
<summary> Issue Description: Sentinel saved queries are not showing up in Advanced Hunting.</summary>

**Possible Causes:**
 
1. Queries are not showing also in the Sentinel workspace.
2. Error in loading Sentinel saved queries from Log Analytics.

**Troubleshooting Steps:**

1. **Check if the queries are showing up in the Sentinel workspace:** Check if the missing queries are showing in the Sentinel workspace. If not, those queries might have been removed from the workspace and therefore will not show in Advanced Hunting.

2. Check errors in loading Sentinel saved queries:

   ```q
   cluster('wcdprod').database('Geneva').InETraceEvent
   | where env_time > ago(1d)
   | where AadTenantId == "{tenant_id}"
   | where service_name == "ine-huntingservice-external"
   | where Source has "LogAnalyticsQueriesProvider"
   | where LevelId < 3
   | project env_time, Message, ContextId
   ```
</details>

## Function Issues

<details open>
<summary> Issue Description: Sentinel functions are not showing up in Advanced Hunting. </summary>

**Possible Causes:** 

1. Functions are not showing also in the Sentinel workspace.
2. Error in loading Sentinel functions from Log Analytics.

**Troubleshooting Steps:**
1. **Check if the functions are showing up in the Sentinel workspace:** Check if the missing functions are showing in the Sentinel workspace. If not, those functions might have been removed from the workspace and therefore will not show in Advanced Hunting.

2. **Check errors in loading Sentinel functions:** Run the following query to check failures in loading Sentinel functions:

   ```q
   cluster('wcdprod').database('Geneva').InETraceEvent
   | where env_time > ago(1d)
   | where AadTenantId == "{tenant_id}"
   | where service_name == "ine-huntingservice-external"
   | where Source has "LogAnalyticsFunctionsProvider"
   | where LevelId < 3
   | project env_time, Message, ContextId
   ```

</details>

## Portal Performance Issues

<details open>
<summary> Issue Description: Loading of the Advanced Hunting page or parts of it is slow. </summary>

**Possible Causes:** 
1. General portal slowness.
2. Specific browser or environment slowness.
3. Errors in loading the Advanced Hunting page or parts of it.

**Troubleshooting Steps:**

1. **Check general portal slowness:** Check other portal pages for slowness to eliminate wider performance issue in the portal.

2. **Check other browsers and environments:** To narrow down the issue, check if the same slowness is noticeable by other users and when using different browsers. Also check if the slowness can be reproduced in other tenants. In some cases, specific browser extensions of firewalls installed on the customer environment can block packages or API calls consumed by the Advanced Hunting page.

3. **Check console errors:** Page loading can be slower if there are specific API calls, packages or components that are failing to load. To investigate those errors, open the browser dev tools and check the Console and Network tabs for possible errors. Also make sure to download the HAR file from the page and attach it to the customer escalation.

   In case the issue happened once but not reproducing, run the following query to check past errors from Advanced Hunting page:

   ```q
   cluster('m365dprd.westeurope.kusto.windows.net').database('AppInsightsLogs').ExceptionParsed
   | where todatetime(TimeStamp) > ago(1d)
   | where TenantId == "{tenant_id}"
   | where ClientPage == "hunting-2@wicd-hunting"
   | project TimeStamp, ExceptionType, Message
   ```
</details>

# Known Issues (as of 7 Nov 2023)

## Data Parity

- Microsoft 365 Defender tables are queryable with maximum retention of 30 days.

- Microsoft 365 Defender tables contain type differences in some of the columns, specifically object columns which are available in Sentinel as dynamic are string in M365D.

- IdentityInfo table from Sentinel is not available, the IdentityInfo table is as used to be in Microsoft 365 Defender.

- SecurityAlert table is replaced by AlertInfo and AlertEvidence that contain all alerts data. Therefore, it is not available in the schema UI, however, to not break existing query content leveraging this table, you can still query it via the Advanced Hunting editor.

- There are several KQL operators not supported by M365D:

  - Connecting to customer ADX cluster using the adx() operator.
  - Connecting to different Log Analytics workspace using the workspace() operator.

## Feature Parity

- Functions and queries from Sentinel are not editable, available for read/query only.

- Guided mode is supporting Defender data only.

- Custom detections, links to incidents and take actions capabilities are supported on Microsoft 365 Defender data only.

- There is no full parity between Log Analytics results grid capabilities and Advanced Hunting, we are working on closing the most significant gaps.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
