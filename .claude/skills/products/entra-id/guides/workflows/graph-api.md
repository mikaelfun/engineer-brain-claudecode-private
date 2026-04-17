# Entra ID Microsoft Graph API — 排查工作流

**来源草稿**: ado-wiki-a-graph-managing-consent.md, ado-wiki-a-graph-managing-directory-extensions.md, ado-wiki-a-graph-managing-directory-roles.md, ado-wiki-a-graph-managing-licenses.md, ado-wiki-a-graph-managing-mfa-scenarios.md, ado-wiki-a-lab-microsoft-graph-dotnet-webhooks.md, ado-wiki-a-ms-graph-api-tsg.md, ado-wiki-a-ms-graph-endpoint.md, ado-wiki-a-ms-graph-powershell-bodyparameter.md, ado-wiki-a-ms-graph-powershell-usage.md... (+32 more)
**场景数**: 21
**生成日期**: 2026-04-07

---

## Scenario 1: Compliance note
> 来源: ado-wiki-a-ms-graph-api-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshoot geneneral latency or performance issue**
   - There are 2 columns in MS Graph logs that can provide a general idea of how long the request takes to process.  The unit in these columns is based on ticks.
   - > In computing, a tick is a unit of time measurement that represents the smallest time interval recognized by the system clock. One tick typically equals 100 nanoseconds or 0.0000001 seconds1. This me
   - totalOutboundDuration - shows how long the request takes after (Aggregator Service) AGS sends the request to the workload until AGS receives the workload response.  Note that this counter also include

---

## Scenario 2: How to work with BodyParameter in Microsoft Graph PowerShell
> 来源: ado-wiki-a-ms-graph-powershell-usage.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 3: Microsoft Graph Notifications and Change Tracking using Webhooks
> 来源: ado-wiki-b-graph-webhooks-change-notifications.md | 适用: Mooncake ✅

### 排查步骤
- 1. Microsoft Graph POSTs to `{notificationUrl}?validationToken={token}`
- 2. Endpoint must respond within **10 seconds** with:
- 1. Verify notificationUrl is publicly accessible
- 2. Test: `POST {notificationUrl}?validationToken=1234` → should return "1234" as text/plain
- 3. Use Fiddler to test exact request format
- 4. Allow inbound traffic from [Microsoft Graph Change Notifications IP addresses](https://learn.microsoft.com/en-us/microsoft-365/enterprise/additional-office365-ip-addresses-and-urls)
- 1. Respond with **202 Accepted** (if not 2xx, Graph retries for ~4 hours then drops)
- 2. Validate clientState matches subscription
- 3. Execute business logic
- 1. Token not expired

### 关键 KQL 查询
```kql
GraphNotificationsLogEvent 
| where env_time >= ago(7d)  
| where env_cloud_role == "PublisherWorkerRole" and env_cloud_environment == 'Prod' 
| where tagId == "0x56" 
| extend processingTime = tolong(extract("Processing time of successful notification is ([0-9.]+)", 1, message)) 
| extend workloadName = extract("from workloadname ([A-z]+.[A-z]+)", 1, message) 
| summarize percentiles(processingTime, 50, 95, 99, 99.9) by workloadName
```
`[来源: ado-wiki-b-graph-webhooks-change-notifications.md]`

---

## Scenario 4: Transfer Incidents to Users Graph API
> 来源: ado-wiki-b-transfer-incidents-to-users-graph-api.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Test in Graph Explorer First**
   - Before escalating, test the call in [Graph Explorer](https://aka.ms/ge):
   - 1. Sign in to Graph Explorer
   - 2. Set HTTP method and URL to match actual call; include request body for POST/PATCH
2. **Step 2: Required Information for Transfer**
   - Always include:
   - **Client request ID** of the Microsoft Graph call
   - **Timestamp** of the call (must be within last **21 days**)
3. **Step 3: Identify Target Workload Team**

---

## Scenario 5: TSG - Users Graph API Query Latency
> 来源: ado-wiki-b-tsg-users-graph-api-query-latency.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Identify the specific application calling Users Graph API
- 2. Determine if latency affects all apps in tenant or just one
- 3. Measure duration and ratio of high latency requests (count of high latency / count of all requests)
- 1. **UpdateUser vs GetUser**: Update calls have larger response times due to distributed consistency and geo-availability (multiple writes required)
- 2. **Low ratio acceptable**: From RDS perspective, low ratio of high latency is acceptable; no 100% reliability guarantee
- 3. **No SLA for latency**: GetUser typically 200ms-500ms, but can spike to 1s at low ratio

### 关键 KQL 查询
```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-02T01:00)
| where contextId == "<tenantid>"
| where applicationId == "<applicationid>"
| project env_time, httpMethod, operationName, durationMs, correlationId, contextId, internalCorrelationId, applicationId, httpStatusCode, resourcePath, responseObjectCount, filterQueryParameter
```
`[来源: ado-wiki-b-tsg-users-graph-api-query-latency.md]`

```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-06T00:00)
| where contextId == "<tenantid>" and applicationId == "<applicationid>"
| where durationMs >= 5000
| summarize count()
```
`[来源: ado-wiki-b-tsg-users-graph-api-query-latency.md]`

```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-06T00:00)
| where contextId == "<tenantid>" and applicationId == "<applicationid>"
| project todatetime(env_time), durationMs
| render linechart
```
`[来源: ado-wiki-b-tsg-users-graph-api-query-latency.md]`

---

## Scenario 6: Using Microsoft Graph PowerShell to Update Directory Settings
> 来源: ado-wiki-b-update-directory-settings-graph.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 7: Entra Recommendations for Azure AD Graph Retirement
> 来源: ado-wiki-c-entra-recommendations-aad-graph-retirement.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - See [Azure AD Recommendations Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/557307/Azure-AD-Recommendations?anchor=troubleshooting)

---

## Scenario 8: Microsoft Graph Activity Logs
> 来源: ado-wiki-c-ms-graph-activity-logs.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
// MS Graph Activity Logs equivalent
let start = datetime(2025-04-21T18:26:53);
let end = datetime(2025-04-23T18:28:53);
let tenantIdFilter = "{tenant-id}"
let appIdFilter = "{app-id}"
cluster("msgraphkus").database("msgraphdb").GlobalAggregatorServiceLogEvent
| where env_time > start and env_time < end
| where tenantId == tenantIdFilter
| where appId == appIdFilter
| where tagId == 30746268
| extend DurationMs = (totalAgsDuration /10000)
| project startTime,TIMESTAMP,correlationId,tenantId,appId,oidClaim,requestMethod,responseStatusCode,apiVersion,incomingUri,tokenUti,responseSize,tokenClaims,DurationMs,userAgent,env_cloud_location,callerIpAddress
```
`[来源: ado-wiki-c-ms-graph-activity-logs.md]`

---

## Scenario 9: Microsoft Graph IP Addresses
> 来源: ado-wiki-c-ms-graph-ip-addresses.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 10: Register MCP Server and Client Apps
> 来源: ado-wiki-c-ms-graph-mcp-server-step1.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Go to App registrations > All applications > select the client app (e.g., VS Code: aebc6443-996d-45c2-90f0-388ff96faa56)
- 2. Under API Permissions > Add a permission > APIs my organization uses > select "Microsoft MCP Server for Enterprise"
- 3. Choose Delegated permissions > select `<McpPrefix>.User.Read` > Add permissions
- 4. Click Grant admin consent
- 1. Follow Quick Start in https://github.com/microsoft/EnterpriseMCP
- 2. Use `Grant-EntraBetaMCPServerPermission` cmdlet to:

---

## Scenario 11: MS Graph Client Python Response Headers
> 来源: ado-wiki-c-ms-graph-python-response-headers.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 12: How to execute Microsoft Graph commands in Arlington when GraphExplorer is not available
> 来源: ado-wiki-d-graph-commands-arlington-gov-cloud.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Ask the customer to navigate to enterprise application of choice inside Azure Portal
   - 2. Open Developer Tools in the browser
   - 3. Navigate to the Network tab inside Developer Tools

---

## Scenario 13: Continuous Access Evaluation (CAE) in Microsoft Graph API - Troubleshooting Guide
> 来源: ado-wiki-e-cae-msgraph-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 14: MS Graph .NET SDK Logging
> 来源: ado-wiki-e-msgraph-dotnet-sdk-logging.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Implement DelegatingHandler**
   - public class LoggingHandler : DelegatingHandler
2. **Step 2: Add Handler to GraphServiceClient**
   - var authProvider = new AzureIdentityAuthenticationProvider(clientSecretCredential, scopes);
   - var handlers = GraphClientFactory.CreateDefaultHandlers();
3. **Step 1: Install Package**
   - dotnet add package OpenTelemetry.Instrumentation.Http
   - dotnet add package OpenTelemetry.Exporter.Console
4. **Step 2: Enable Instrumentation**
   - using var tracerProvider = Sdk.CreateTracerProviderBuilder()
   - .AddHttpClientInstrumentation()
5. **Step 3 (Optional): Filter to Graph-only Requests**
   - using var tracerProvider = Sdk.CreateTracerProviderBuilder()
   - .AddHttpClientInstrumentation(options =>
6. **Step 4 (Optional): Enrich Telemetry**
   - options.Enrich = (activity, eventName, rawObject) =>

---

## Scenario 15: ado-wiki-f-r4-asc-ms-graph-node-usage
> 来源: ado-wiki-f-r4-asc-ms-graph-node-usage.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In ASC, click the **Azure AD Explorer**
- 1. Click **Microsoft Graph**
- 1. The Microsoft Graph node screen will be displayed without any data in the search windows.
- 1. **Request \(correlation\) id** is the request id or correlation id returned by the failing api call,provided in the response of the request as either part of the body in case of an error, or the re
- 1. **Start Time** represents the start UTC time for the query.
- 1. **End Time** represents the ending UTC time for the query.
- 1. **Application ID** for the application generating the error.  Not required if you have the reqeust ID, can be used to narrow to a specific application's results.  Can be very useful with searching 
- 1. **Workload Id** describes the target work load for a given action.  This value is the same as the TargetWorkloadId returned by the $whatIf query parameter.
- 1. **Status Code\(s\)** - common status codes like 200, 401, 429 returned by a given MS Graph Api.  You can specify multiple status code by adding a comma between each code for example:
- 1. **Maximum rows to return** is used to limit search results to a given number of rows.

---

## Scenario 16: Microsoft Graph Security API
> 来源: ado-wiki-f-r4-ms-graph-security-api-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. How to make generic calls to Microsoft Graph Security API and general questions about proper queries
- 1. Missing alerts or missing information in a alert.
- 1. $top/$skip/$skiptoken. Page size limit = 1000. Top+skip limit = 6000
- 1. $select. Show only limited properties
- 1. 206 Partial Content. See warning header for more details.
- 1. 400 Bad Request. Unsupported OData filter, invalid PATCH content
- 1. 403 Forbidden. Missing permissions in access token or user is not authorized (User does not have permission in Provider).
- 1. 404 Not Found. Entity is not found by given ID
- 1. 429 Too Many Requests. Requests are throttled when customers send too many requests in short time.
- 1. 503 Service Unavailable. Server currently busy, clients should try again.

---

## Scenario 17: Manage Domain Federation Settings with MS Graph
> 来源: ado-wiki-g-manage-domain-federation-ms-graph.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting via ASC**
   - Check Federation tab under Domains in ASC
   - Use ASC Graph Explorer: `/domains/{domainName}/federationConfiguration`
   - Kusto: Query `GlobalIfxRestBusinessCommon` in `msodsuswest` cluster, filter by tenantId and `operationName contains "Domain federationConfiguration"`

---

## Scenario 18: Add an Owner to an Application Using Microsoft Graph
> 来源: mslearn-add-owner-for-application-microsoft-graph.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
2. **Step 1: Get the Application Object ID**
   - Azure Portal → Entra ID → App registrations → copy Object ID
3. **Step 2: Get the Service Principal Object ID**
   - Azure Portal → Entra ID → Enterprise applications → copy Object ID
4. **Step 3: Add Owner via Graph API**
   - *Graph Explorer:**
   - POST https://graph.microsoft.com/v1.0/applications/{app-object-id}/owners/$ref
5. **Troubleshooting**

---

## Scenario 19: Use Managed Identities to Call Microsoft Graph APIs
> 来源: mslearn-call-graph-api-using-managed-identities.md | 适用: Mooncake ✅

### 排查步骤
1. **Step 1: Configure Permissions for Managed Identity**
   - All managed identities have a service principal visible in the Enterprise Apps blade. Grant Microsoft Graph permissions via OAuth Permission Grant using PowerShell:
   - $TenantID = "{your tenant id}"
2. **Step 2: Get Access Token**
   - Request token from resource `https://graph.microsoft.com`.
   - > **Note:** After requesting a token, the same token is cached for 24 hours. Permission changes won't reflect until the current token expires.

---

## Scenario 20: Microsoft Graph API 错误处理与重试逻辑（PowerShell）
> 来源: mslearn-graph-api-error-handling-powershell.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 21: App Role Management via Microsoft.Graph PowerShell
> 来源: onenote-app-role-management-msgraph.md | 适用: Mooncake ✅

### 排查步骤
- 1. **App role assignment fails without Service Principal**: Must create SP first via `New-MgServicePrincipal`. Error shown if SP doesn't exist.
- 2. **Same app role GUID can be assigned to different applications** - this is supported.
- 3. **Orphaned role assignments**: Remove group assignments BEFORE deleting the app role. Leftover assignments won't grant access but cause confusion.
- 4. **Best practice**: Always delete role assignments before deleting the role itself.

---
