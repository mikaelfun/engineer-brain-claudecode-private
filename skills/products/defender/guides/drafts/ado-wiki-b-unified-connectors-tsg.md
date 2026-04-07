---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Unified connectors/[TSG] - Unified connectors"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FNext-Gen%20-%20Microsoft%20Sentinel%20(USX)%2FUnified%20connectors%2F%5BTSG%5D%20-%20Unified%20connectors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Training Sessions
|Date (DD/MM/YYYY) | Session Recording | Presenter |
|--|--|--|
| 13/08/2025 | [Unified Connectors - Okta connector](https://platform.qa.com/resource/unified-connectors-okta-connector-1854/?context_id=14133&context_resource=lp) | Hovav Zahav and Menny Mezamer-Tov|

---
# Limitations 
Unified Connectors are not currently supported for GCC enviroments and navigating to the blade will be presented with an error: "Unable to load connectors" "Error loading connectors: AxiosError: Request failed with status code 500".

# ICM & Telemetry Details

## ICM Queues
- Sentinel (UC owners)
	- Owning Service - Microsoft Sentinel Data Connectors
	- Owning Team - UI/Portal
	- Sentinel is the owner temporarily, until MSG team take ownership of UC.
- Scuba
	- Owning Service - Scuba Security Platform
	- Owning Team - Platform-Sentinel

## Telemetry Access
- UC FE Telemetry
	-   **Kusto Cluster**: https://m365dprd.westeurope.kusto.windows.net
	-   **Database**: GenevaLogs
	-   **Permissions**: Request "Log Reader" access via MPS-FrontEnd entitlement
	-   **Access Guide**: https://aka.ms/scckustoaccess
- UCC/UCH BE Telemety
	-   **Kusto Cluster**: https://securityinsights.kusto.windows.net/
	-   **Database**: SecurityInsightsProd
	-   **Request Access**: https://coreidentity.microsoft.com/manage/Entitlement/entitlement/sentinelsupp-253y
- Scuba Telemety
	-   **Kusto Cluster**: https://scubaops.westus2.kusto.windows.net/
	-   **Database**: DevOps
	-   **Request Access**: Join security group 'scuba-kusto-prod-readers' via idweb (search here: https://idweb.microsoft.com/IdentityManagement/aspx/Groups/AllGroups.aspx)


# General Platform Details

## What Happens When a Connector Instance Has Been Created
-   It can take up to 30 minutes before data starts being collected.
-	Only once data starts being collected, will the 'Connection Status' change from 'Pending' to either 'Success' or 'Error'.
-   Different endpoints are collected depending on which protection types are enabled for the tenant. For example, in the Okta connector:
    -   SystemLogs are collected when MDI or SIEM are enabled.
    -   All other Okta endpoints (such as users, groups, apps, etc.) are collected only if MDI is enabled.
-   Depending on the connector and its endpoints, either full data or only recent changes may be collected initially. For example:
    -   **SystemLogs**: Only delta data is collected  meaning logs from up to 1 hour _before_ the start of data collection. So if data collection begins 30 minutes after instance creation, only events from 30 minutes before instance creation onward will be ingested.
    -   **Users** (and most other Okta endpoints): A full data collection is performed first. After that, deltas are collected every configured number of minutes.

## Basic Telemetry Queries
The following are important queries you will need for most issues. The will be referred to in concrete troubleshooting steps below.

### Instances Snaphot Telemetry Query
* UCC logs a snapshot of connector instances for all tenants **every 12 hours** (only for tenants with at least one instance).
* This is a point-in-time snapshot  newly added or recently deleted instances may not be reflected yet. Also, instances that failed to be created will not be included here.
* You can use this query to retrieve `ConnectorId` and `InstanceId` values for a given tenant, along with their enabled protection types, and LogAnalytics Workspace/DCR details (assuming 'SIEM' was enabled for the given connector instance).
* You can also use this query to get a full picture of *all* tenants' instances in all data-centers.
* The query will return the latest snapshot for each tenant. You can set the time range arguments back if you need to investigate older snapshots in a specific time range. But usually, you should use the last 1 day snapshot.

```q
let myStartTime = ago(1d);
let myEndTime = now();
let myTenant = ''; // Change to the customer's tenant ID or leave empty if you need a snapshot of all tenants.
cluster("https://securityinsights.kusto.windows.net/").database("SecurityInsightsProd").UnifiedConnectorsControllerLatestInstanceSnapshot(myStartTime,myEndTime)
| where isempty(myTenant) or tenantId == myTenant
```

### Operations Summary Telemetry Query
* You can get a full picture of all the connector instance *operations* made for a given tenant in a given time range, or for all tenants. 
* The result includes all create/update/delete instances attempts (but not GET operations). 
* Note that the result includes both operations that succeeded and failed with details related to the failure, so it should be especially helpful in investigating customer complaints about failures to perform instance changes via the UI.
* This may also help if the customer failed to create a connector instance altogether, so it will not appear in the snapshot query above.
* Change the time range arguments to match the time the operation was performed.

```q
let myStartTime = ago(1d);
let myEndTime = now();
let myTenant = ''; // Change to the customer's tenant ID or leave empty if you need to see operations for all tenants.
cluster("https://securityinsights.kusto.windows.net/").database("SecurityInsightsProd").UnifiedConnectorsControllerInstanceManagementOperations(myStartTime,myEndTime)
| where isempty(myTenant) or tenantId == myTenant
```

## How to Retrieve ConnectorId / InstanceId for a Given Tenant
-   The scenarios and telemetry queries below require a `ConnectorId`. It's usually easier to investigate a specific instance using its `InstanceId`.
-   Note:
    -   The `ConnectorId` is the same for all tenants using the same connector (e.g., Oktas is `f23e747c-c466-4229-9ff3-02bd08da3d9f`).
    -   Each connector **instance** has a unique, auto-generated `GUID`.

### Through Portal
-   The customer or CSS can open the tenant's Unified Connectors UI gallery (in the SCC portal).
-   Open the browser's Developer Tools  Network tab, then refresh the page.
-   Look for a request with `'unified'` in its URL (e.g.,  
    `https://security.microsoft.com/apiproxy/mtp/unifiedConnectors/public/connectors`).
-   The response includes a list of connectors for the tenant:
    -   For each connector: the `id` field is the `ConnectorId`.
    -   The `instances` field contains all instances for the connector.
    -   Each entry has an 'instances' list, each one has an `id` field  this is the `InstanceId`.
-   You can use these values in telemetry queries like the ones below.

### Through Telemetry Cluster
* Run the query above under 'Instances Snaphot Telemetry Query' with the customer's tenantId. This will return the snapshot of that tenant's connector instances. You can copy 'connectorId' and 'instanceId' and use in subsequent steps.

## SIEM Infrastructure Setup During Connection

When a connector instance is configured with SIEM protection enabled, the system automatically creates the necessary Azure Monitor infrastructure during the connection process. You can observe this setup by monitoring network calls in the browser's Developer Tools.

### What to Monitor in Browser Network Tab:

During SIEM connector setup, watch for these three types of API calls that create the required infrastructure:

1. **Data Collection Endpoint (DCE) Creation**

    - **Network Call Pattern**: Look for POST/PUT requests to URLs containing `/dataCollectionEndpoints/`
    - **Purpose**: Creates the ingestion endpoint for data collection
    - **Success Indicator**: HTTP 200/201 response with DCE resource details
    - **Common Issues**:
        - HTTP 403/401 = Insufficient permissions on subscription/resource group
        - HTTP 409 = DCE already exists (usually not an error)

2. **Log Analytics Custom Tables Creation**

    - **Network Call Pattern**: Look for POST/PUT requests to URLs containing `/tables/` and table names like `CL` suffix
    - **Purpose**: Creates custom tables in the Log Analytics workspace to store connector data
    - **Success Indicator**: HTTP 200/201 response for each table created
    - **Common Issues**:
        - HTTP 403/401 = Insufficient permissions on Log Analytics workspace
        - HTTP 400 = Table schema validation errors

3. **Data Collection Rule (DCR) Creation**
    - **Network Call Pattern**: Look for POST/PUT requests to URLs containing `/dataCollectionRules/`
    - **Purpose**: Defines how data flows from the connector to the destination tables
    - **Success Indicator**: HTTP 200/201 response with DCR resource and immutable ID
    - **Common Issues**:
        - HTTP 403/401 = Insufficient permissions
        - HTTP 400 = Invalid DCR configuration or missing required properties

### Troubleshooting Infrastructure Setup Issues:

**If you see 403/401 errors on any of these calls:**

-   Customer needs Contributor or Log Analytics Contributor role on the target workspace
-   For DCE/DCR: Customer needs Contributor role on the subscription/resource group

**If you see 400 errors:**

-   Check the request payload in the failed network call for validation details
-   Common issues include incorrect workspace references or schema problems

**If calls time out or return 500 errors:**

-   Check Azure service health for the target region
-   Retry the connection after a few minutes

This infrastructure setup must complete successfully before data collection can begin. All three components (DCE, Tables, DCR) work together to establish the complete data ingestion pipeline.


# Common Error Messages and Troubleshooting Guidance

## 1. Error connecting - SIEM Infrastructure Setup Failures

**Issues during SIEM setup when connecting with SIEM protection enabled**

When customers report errors during SIEM connector setup, check the browser's Network tab to identify which infrastructure component failed to create.

### 1.1 Failed to Create Log Analytics Custom Tables

**What to Look For**: Failed POST/PUT requests to URLs containing `/tables/` with table names ending in `_CL`

**Network Call Investigation**:

-   **Status Code 403/401**: Check the network request details
-   **Status Code 400**: Look at the response body for validation errors
-   **Status Code 500**: Azure service issue, check Azure Status page

**Common Status Codes and Meanings**:

-   **HTTP 403/401**: Customer lacks Log Analytics Contributor role on the target workspace
-   **HTTP 400**: Table schema validation failed - check request payload for invalid schema
-   **HTTP 404**: Log Analytics workspace doesn't exist or isn't accessible
-   **HTTP 500**: Temporary Azure service issue

**Troubleshooting Steps**:

-   Verify customer has Log Analytics Contributor role on the specified workspace
-   Confirm the workspace exists in the correct subscription and resource group
-   If 400 error: Check the request payload in the failed network call for validation details

### 1.2 Failed to Create DCE (Data Collection Endpoint)

**What to Look For**: Failed POST/PUT requests to URLs containing `/dataCollectionEndpoints/`

**Network Call Investigation**:

-   Check the request URL to identify target subscription/resource group
-   Review response body for specific error details
-   Note the target region in the request

**Common Status Codes and Meanings**:

-   **HTTP 403/401**: Customer lacks Contributor role on subscription/resource group
-   **HTTP 409**: DCE already exists (usually not an error, check if setup continues)
-   **HTTP 400**: Invalid DCE configuration or region not supported
-   **HTTP 500**: Azure service temporary unavailability

**Troubleshooting Steps**:

-   Verify customer has Contributor role on the target subscription/resource group
-   Check if the target region supports Data Collection Endpoints
-   If 409 error: Verify the existing DCE is accessible and in the correct region

### 1.3 Failed to Create DCR (Data Collection Rule)

**What to Look For**: Failed POST/PUT requests to URLs containing `/dataCollectionRules/`

**Network Call Investigation**:

-   Check if the DCE and Log Analytics tables were created successfully first
-   Review the request payload for DCR configuration details
-   Look for immutable ID in successful DCR creation response

**Common Status Codes and Meanings**:

-   **HTTP 403/401**: Insufficient permissions on subscription/resource group
-   **HTTP 400**: Invalid DCR configuration, missing required properties, or workspace/DCE reference issues
-   **HTTP 404**: Referenced workspace or DCE doesn't exist
-   **HTTP 500**: Service-side validation failures

**Troubleshooting Steps**:

-   Ensure DCE and Log Analytics tables were created successfully (check previous network calls)
-   Verify workspace and DCE are in the same region
-   If 400 error: Check request payload for invalid references to workspace or DCE resources

## 2. Error connecting - Non-routable network address
**"The following URI resolves to a non-routable network address: ..."**

This error is usually shown in the UI when performing the failed operation, or you might also see them when running the 'Operations Summary Telemetry Query' above.

This typically indicates that the customer provided an account/domain name that either resolves to an incorrect url or a blocked url.
For example, for the Okta connector, it can be one of the following:
-   A partial Okta domain (missing the `.okta.com` suffix), such as `'trial-8686-admin'` instead of `'trial-8686-admin.okta.com'`.
-   An Okta domain that resolves to an address blocked by our security policy, as it targets a restricted network range. This protection prevents unsafe server-side requests (SSRF).

## 3. Error connecting - Connectivity Checks Failure
**"Connectivity checks with the data source failed for some of the instance's connections"**
This error is usually shown in the UI when performing the failed operation, or you might also see them when running the 'Operations Summary Telemetry Query' above.

This usually means the customer provided an incorrect API key for their Okta account. Common reasons include:
-   The API key does not exist.
-   The API key is blocked from accessing some Okta endpoints.
-   The API key does not match the provided Okta domain.

Run the following query in the relevant Kusto cluster to retrieve telemetry data (ScubaConfigApi service):

```q
let tenantId = {tenant_id}; // Change the tenant id to the customer's tenant.
let connectorId = {connector_id}; // This is Okta connector id; you can replace it with a different connector id if needed
let instanceId = ''; // If you have a specific instance id that's causing problem, put it here.
let startTime = ago(1h); // Update according to time of failure
let endTime = now(); // Update according to time of failure
cluster("https://scubaops.westus2.kusto.windows.net/").database("DevOps").TraceEvent
| where env_time between (startTime..endTime)
| where message contains tenantId and message contains 'ScubaConfigAPIApp'
| where isempty(connectorId) or message contains (connectorId)
| where isempty(instanceId) or message contains (instanceId)
| project-reorder env_time, message
| take 1000
```

## 4. Error connecting - Internal server error

**"Internal server error"**
Use UCC/Scuba telemetry to investigate the root cause.  
If telemetry does not provide enough information, escalate to the UC team.

This error is usually shown in the UI when performing the failed operation, or you might also see them when running the 'Operations Summary Telemetry Query' above.

Run the following query in the relevant Kusto cluster to retrieve telemetry data (unified connectors controller service):

```q
let myTenantId = {tenant_id}; // Change the tenant id to the customer's tenant.
let myStartTime = ago(1h); // Update according to time of failure
let myEndTime = now(); // Update according to time of failure
cluster("https://securityinsights.kusto.windows.net/").database('SecurityInsightsProd').Span
| where env_time between (myStartTime..myEndTime)
| where serviceName startswith ("UnifiedConnectorsController-")
| where env_properties has myTenantId or TenantId == myTenantId
| where name startswith "Microsoft.Security.Usx.UnifiedConnectorsController"
| where name !in ('Microsoft.Security.Usx.UnifiedConnectorsController.Common.Middlewares.RedirectMiddleware')
| project-reorder env_time, DATA_CENTER,  serviceName, name, success, httpMethod, httpStatusCode, env_properties
| union (Log
| where env_time between (myStartTime..myEndTime)
| where serviceName startswith ("UnifiedConnectorsController-")
| where env_properties has myTenantId or TenantId == myTenantId
| where name startswith "Microsoft.Security.Usx.UnifiedConnectorsController"
| where name !in ('Microsoft.Security.Usx.UnifiedConnectorsController.Common.Middlewares.RedirectMiddleware')
| project-reorder env_time, DATA_CENTER, serviceName, severityText, name, body, env_properties, env_ex_type, env_ex_msg, env_ex_stack)
```

## 5. Issue - Data collection Stopped or Incorrect
**Customer doesn't see data for the given connector or partial data only**
-   Note that once a connector instance has been created, it can take up to 30 minutes before data starts being collected.

Run the following query in the relevant Kusto cluster to retrieve telemetry data (Scuba data collection):

```q
let tenantId = {tenant_id}; // Change the tenant id to the customer's tenant.
let connectorId = {connector_id}; // This is Okta connector id; you can replace it with a different connector id if needed
let instanceId = ''; // If you have a specific instance id that's causing problem, put it here.
let startTime = ago(1h); // Update according to time of issue
let endTime = now(); // Update according to time of issue
cluster("https://scubaops.westus2.kusto.windows.net/").database("DevOps").TraceEvent
| where env_time between (startTime..endTime)
| where message contains tenantId and message contains 'UberCollectorApp'
| where isempty(connectorId) or message contains (connectorId)
| where isempty(instanceId) or message contains (instanceId)
| project-reorder env_time, message
| take 1000
```

Run the following query in the relevant Kusto cluster to retrieve telemetry data (unified connectors health service):

```q
let tenantId = {tenant_id}; // Change the tenant id to the customer's tenant.
let connectorId = {connector_id}; // This is Okta connector id; you can replace it with a different connector id if needed
let instanceId = ''; // If you have a specific instance id that's causing problems, place it here.
let startTime = ago(1h); // Update according to need
let endTime = now();
cluster("https://securityinsights.kusto.windows.net/").database('SecurityInsightsProd').UnifiedConnectorsHealthFullMessages(ago(1d), now())
| where env_time between (startTime..endTime)
| where TenantId == tenantId
| where isempty(connectorId) or ConnectorId  == connectorId
| where isempty(instanceId) or InstanceId  == instanceId
| project-reorder env_time, K8S_CLUSTER_NAME, TenantId, ConnectorId, InstanceId, ConnectionName, HealthResultType, StatusCode, StatusMessage, DataVolume
| take 1000
```

## 6. Issue - Connection Status Shows 'Error'
**Connector gallery or connector page shows an error in the "Connection Status" column**
Navigate to the connector page and review the status details. If the issue remains unclear:
-   Query the UCH telemetry for more insight.
-   If necessary, escalate to the UC team.

Run the following query in the relevant Kusto cluster to retrieve telemetry data (unified connectors health service):

```q
let tenantId = {tenant_id}; // Change the tenant id to the customer's tenant.
let connectorId = {connector_id}; // This is Okta connector id; you can replace it with a different connector id if needed
let instanceId = ''; // If you have a specific instance id that's causing problems, place it here.
let startTime = ago(1h); // Update according to need
let endTime = now();
cluster("https://securityinsights.kusto.windows.net/").database('SecurityInsightsProd').UnifiedConnectorsHealthFullMessages(ago(1d), now())
| where env_time between (startTime..endTime)
| where TenantId == tenantId
| where isempty(connectorId) or ConnectorId  == connectorId
| where isempty(instanceId) or InstanceId  == instanceId
| project-reorder env_time, K8S_CLUSTER_NAME, TenantId, ConnectorId, InstanceId, ConnectionName, HealthResultType, StatusCode, StatusMessage, DataVolume
| take 1000
```

## 7. Issue - Connection Status Shows 'Pending'
**Connector gallery or connector page shows 'Pending..' in the "Connection Status" column**
Note that once a connector instance has been created, it can take up to 30 minutes before data starts being collected and to get an updated status. So it's ok to have 'Pending' in the first 30 minutes.
If it takes from than 30 minutes, you can escalate to UC team.

## 8. Issue - Customer Cannot Enable SIEM/MDI
**Connector wizard shows SIEM/Identity checkboxes as disabled with 'Prerequisties not met' message**

If the customer hovers over the 'Prerequisties not met' label, more details will appear regarding the reason. Options are:
- 'Missing permissions: SecurityConfig.Manage'
	- This means that the user is missing a require MTP role for the given workload (either Sentinel or MDI).
	- For MDI - the tenant admin can grant the user the needed permissions via the SCC portal (System -> Permissions).
	- For Sentinel - the tenant admin needs to grant the user 'Sentinel Contributor' role in **Azure** on the needed LA workspaces. Once permissions were granted, it can take up to 1 hour to get updated in the SCC portal.
- 'Workload is not active'
	- This means that the tenant is missing license for the given workload (Sentinel, MDI) or the license is not active.
	- For MDI, the tenant admin get check in the SCC portal: System -> Settings -> Identities
		- This will either indicate that no license exists. If a screen showing 'Hang on! We're preparing your Microsoft Defender for Identity Workspace', this can also explain the issue.
		- In any such cases, this is an MDI issue.
	- For Sentinel, it may mean that no workspace were onboarded to USX via the SCC portal.
		- Through SCC portal, the tenant admin can add workspace to USX: System -> Settings -> Microsoft Sentinel -> add the workspace.
	
## 9. Frontend Error Investigation

**Investigating UI errors, JavaScript exceptions, and frontend issues in the Unified Connector interface**

When users experience UI issues, loading problems, or unexpected behavior in the Unified Connector interface, use the following query to investigate frontend errors and user interactions.

**Common Frontend Issues**:

-   UI components not loading properly
-   JavaScript errors preventing user actions
-   API call failures from the frontend
-   Connector requirements fetching errors
-   Workspace metadata loading failures
-   Page load timeouts or performance issues

**Frontend Error Investigation Query**:

```q
let tenantId = {tenant_id}; // Change to customer's tenant ID
let userId = ''; // Add specific user ID if known
let sessionId = ''; // Add specific session ID if known
let startTime = ago(1h); // Update according to time of issue
let endTime = now(); // Update according to time of issue
cluster("https://m365dprd.westeurope.kusto.windows.net").database("GenevaLogs").ClientEventLogParsed
| where env_time between (startTime..endTime)
| where ClientPage contains "@sentinel-unified-connector"
| where isempty(tenantId) or TenantId == tenantId
| where isempty(userId) or UserId == userId
| where isempty(sessionId) or SessionId == sessionId
| where LogLevel == 6  // Error logs only
| extend ParsedData = parse_json(Data)
| project
    env_time,
    Message,
    TenantId,
    UserId,
    SessionId,
    CorrelationId,
    Page,
    Browser,
    BrowserVersion,
    OS,
    ExceptionType,
    ExceptionMessage,
    ExceptionDetails,
    ParsedData,
    env_cloud_environment
| order by env_time desc
| take 100
```

**Specific Error Pattern Queries**:

```q
// Connector Requirements Errors
cluster("https://m365dprd.westeurope.kusto.windows.net").database("GenevaLogs").ClientEventLogParsed
| where env_time between (ago(1h)..now())
| where ClientPage contains "@sentinel-unified-connector"
| where Message contains "Error fetching connector requirements"
| project env_time, Message, TenantId, UserId, CorrelationId, Data

// Workspace Metadata Errors
cluster("https://m365dprd.westeurope.kusto.windows.net").database("GenevaLogs").ClientEventLogParsed
| where env_time between (ago(1h)..now())
| where ClientPage contains "@sentinel-unified-connector"
| where Message contains "Error fetching workspace metadata"
| extend WorkspaceId = extract(@"Workspace with ID ([a-f0-9\-]+)", 1, Message)
| project env_time, Message, WorkspaceId, TenantId, UserId, CorrelationId

// User Journey Analysis (for specific session)
cluster("https://m365dprd.westeurope.kusto.windows.net").database("GenevaLogs").ClientEventLogParsed
| where env_time between (ago(1h)..now())
| where ClientPage contains "@sentinel-unified-connector"
| where SessionId == "[specific-session-id]"  // Replace with actual session ID
| project env_time, LogLevel, Message, Page, Data
| order by env_time asc

// Performance Issues
cluster("https://m365dprd.westeurope.kusto.windows.net").database("GenevaLogs").ClientEventLogParsed
| where env_time between (ago(1h)..now())
| where ClientPage contains "@sentinel-unified-connector"
| where Message == "Performance Marker"
| extend ParsedData = parse_json(Data)
| extend Duration = tolong(ParsedData.duration)
| where Duration > 10000  // Longer than 10 seconds
| project env_time, Duration, TenantId, UserId, Page, ParsedData
| order by Duration desc
```

**Investigation Tips**:

1. **Start with Error Query**: Use the main error query to identify patterns
2. **Follow Session Journey**: Use SessionId to trace complete user experience
3. **Correlate with Backend**: Use CorrelationId to match frontend errors with backend issues
4. **Check Performance**: Review performance markers if users report slowness
5. **Browser Compatibility**: Check Browser and BrowserVersion fields for compatibility issues

**Common TagIds for Reference**:

-   **413357**: Error events (connector requirements, workspace metadata)
-   **500320**: Page load events
-   **500634**: Performance markers
-   **500640**: AJAX call logging

# Boundaries
If it's not clear as to whether the case fails within the Infrastructure, MDI, or Azure Monitor support boundaries, then you should accept ownership of the case, perform your first quality response (FQR), engaging the customer to better understand their issue. Once you understand the issue, follow the below guidelines and either transfer the whole case or send a collaboration task to the proper team.

## UC
At the moment, the Sentinel team owns the UC (unified connectors) infrastructure. However, the ownership is in transition to the MSG team.
- The UC team is responsible for the following:
	- UC UI (Unified Connectors Gallery)
	- UCC BE API
	- UCH BE API
	- Integration with Scuba
	- Notifying MDI on every connector instance change by tenants
	- Connectors operations and look in UI
- The UC team should handle cases such as:
	- UC UI is broken or incorrect.
	- API calls to create LA resources (such as DCE, DCR, LA custom table)
		- Failures that related to incorrect requests (for example, invlid KQL).
		- Note that more other failures are either a customer error or an Azure Monitor issue (see item #1 under 'Common Error Messages and Troubleshooting Guidance' section), and see 'Azure Monitor' section under 'Boundaries').
	- Calls to UCC BE failures (all calls with this prefix 'https://security.microsoft.com/apiproxy/mtp/unifiedConnectors')
		- Note that 400, 401, and 403 are usually related to customer errors.
	- Connection status is 'Error'
		- The UI includes details regarding the failure, so customer (or CSS) should follow the error and act accordingly, if possible.
		- If issue is unclear, UC team can be involved.
	- Data stopped being collected or is incorrectly collected for the selected LA workspace.
		- This can sometimes be a Scuba issue. The first step is for CSS to investigate Scuba telemetry on their own. If issue is clearly on Scuba's side, transfer the incident to Scuba or ask for assistance. If issue is unclear, the UC team should own it and transfer to Scuba later with additional details if needed.
	- Scuba routing rules were not created or were incorrectly created.
	- MDI did not get ServiceBus notifications after connector instance operation (create, update, delete)

## MDI
MDI team should own every issue that happens to the collected data *after* it has been sent to MDI.
- If data stopped being collected or is partial, it depends on the connector and who developed it (some connectors/endpoints are developed by MDI for UC). You can trasnfer to UC team, and they might return the incident back to MDI.

## Scuba
Scuba team owns data collection, assuming routing rules were created correctly.
- In most cases, it's difficult to differentiate whether a data collection issue happens due to Scuba issues or incorrect routing rule configuration by UCC.
- Thus, usually data collection issue should first be assigned to UC team. Later, UC team can transfer it to Scuba with additional details.

Scuba team also owns the ScubaConfigApi (the service that performs check connectivity).
- Http 500 (InternalServerError) when calling ScubaConfigApi should be transferred to Scuba team.
- Other HTTP failures (400, 401, 403) should be transferred to UC team. They can transfer to Scuba if needed.
- Failures in the actual check connectivity call to the data source (no http failures), are usually related to customer error (incorrect account, incorrect api key, etc.).

## Azure Monitor
The Azure Monitor team is responsible for the following:
- Failures relating to creation of DCR, DCE, LA custom table that are not related to incorrect request.
- Mostly, every relevant call whose http status code is not 400 (BadRequest). In such cases, it's either an Azure Monitor issue (that should be owned by that team) or a customer error issue (see item #1 under 'Common Error Messages and Troubleshooting Guidance' section).

---
# Additional Information

## Public Documentation
- [**In Review** - Unified Connectors Platform for Microsoft Security Solutions](https://review.learn.microsoft.com/en-us/azure/sentinel/unified-connector?branch=pr-en-us-302665)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
