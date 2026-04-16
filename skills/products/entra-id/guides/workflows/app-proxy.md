# Entra ID Application Proxy — 排查工作流

**来源草稿**: ado-wiki-a-app-proxy-connector-event-logs.md, ado-wiki-a-app-proxy-connector-installation-tsg.md, ado-wiki-a-app-proxy-edge-mobile-redirection-tsg.md, ado-wiki-a-app-proxy-msgraph-apis.md, ado-wiki-a-app-proxy-saml-sso.md, ado-wiki-b-app-proxy-401-kcd-troubleshooting.md, ado-wiki-b-app-proxy-communication-flow-architecture.md, ado-wiki-b-app-proxy-connector-inactive.md, ado-wiki-b-app-proxy-cookies.md, ado-wiki-b-app-proxy-data-collection-action-plans.md... (+31 more)
**Kusto 引用**: gateway-throttle.md
**场景数**: 33
**生成日期**: 2026-04-07

---

## Scenario 1: Microsoft Entra Application Proxy Connector Event Logs
> 来源: ado-wiki-a-app-proxy-connector-event-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 2: Microsoft Entra Application Proxy Connector - Installation Troubleshooting
> 来源: ado-wiki-a-app-proxy-connector-installation-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Possible Root Causes**
   - Network issues / network configuration
   - Problems with the registration account
   - Browser configuration issues
2. **Troubleshooting Steps**
   - > The error message from the connector installer might be misleading. Follow these steps regardless of the displayed error.

### 关键 KQL 查询
```kql
RegistrationRegisterOperationEvent
| where env_time > ago(1h) and subscriptionId == "REPLACE_WITH_TENANTID" and feature == "ApplicationProxy"
| project operationName, operationType, connectorId, SourceNamespace, userAgent, resultType
```
`[来源: ado-wiki-a-app-proxy-connector-installation-tsg.md]`

---

## Scenario 3: Troubleshooting Azure AD Application Proxy Redirection in Edge Mobile Browser
> 来源: ado-wiki-a-app-proxy-edge-mobile-redirection-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**

### 关键 KQL 查询
```kql
UserQueriesAllApplicationsOperationEvent
| where env_time > datetime("YYYY-MM-DDThh:mm:ss") and env_time < datetime("YYYY-MM-DDThh:mm:ss")
    and subscriptionId contains "REPLACE_WITH_TENANT_ID"
    and userObjectId == "REPLACE_WITH_USEROBJECT_ID"
| project env_time, applicationMapping, assignedApplicationCount, applicationCount, dbApplicationCount
```
`[来源: ado-wiki-a-app-proxy-edge-mobile-redirection-tsg.md]`

---

## Scenario 4: Microsoft Entra Application Proxy - MSGraph APIs Reference
> 来源: ado-wiki-a-app-proxy-msgraph-apis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Create Custom Application**
   - Template ID for custom application: `8adf8e6e-67b2-4cf2-a259-e3dc5476c621`
   - POST https://graph.microsoft.com/beta/applicationTemplates/8adf8e6e-67b2-4cf2-a259-e3dc5476c621/instantiate
2. **Step 2: Configure Application Proxy Properties**
   - PATCH https://graph.microsoft.com/beta/applications/{appObjectId}
   - Content-type: application/json
3. **Step 3: Assign Connector Group**
   - 1. **Get connectors:** `GET https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectors`
   - 2. **Create connectorGroup:** `POST https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectorGroups`
   - 3. **Assign connector to group:** `POST https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectors/{connectorId}/memberOf/$ref`
4. **Step 4: Configure SSO (IWA example)**
   - PATCH https://graph.microsoft.com/beta/applications/{appObjectId}
5. **Step 5: Assign Users**
   - 1. Get appRoles: `GET https://graph.microsoft.com/beta/servicePrincipals/{spObjectId}/appRoles`
   - 2. Create assignment: `POST https://graph.microsoft.com/beta/servicePrincipals/{spObjectId}/appRoleAssignments`
6. **Troubleshooting**
   - Logs for graph calls: http://aka.ms/graphlogs
   - ICM escalation: Service "AAD Application Proxy", Team "On Call Team"

---

## Scenario 5: Microsoft Entra Application Proxy - SAML Single-Sign On
> 来源: ado-wiki-a-app-proxy-saml-sso.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Publish Application with Application Proxy**
   - 1. Sign into the Entra portal
   - 2. Follow standard "Publish applications using Azure AD Application Proxy" steps
   - 3. Copy the External URL for use in SAML configuration
2. **Step 2: Configure SAML SSO**
   - 1. Follow "Enter basic SAML configuration" steps
   - 2. **Critical:** The **Reply URL** root must match or be a path under the **Application Proxy External URL**
   - If the back-end application expects the Reply URL to be the internal URL, install the **My Apps Secure Sign-In Extension** for automatic client-side redirect
3. **Step 3: Testing**
   - Navigate to the **external URL** in the browser. Sign in with the test account.
4. **Troubleshooting**
   - Follow standard Microsoft Entra Application Proxy documentation. For SAML-specific issues, Kusto queries to determine if the app is configured to use SAML SSO are available (supplied by PG).

---

## Scenario 6: Microsoft Entra Application Proxy - Backend server responds with 401 Unauthorized / 403 Forbidden
> 来源: ado-wiki-b-app-proxy-401-kcd-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Root cause verification**
   - In Kusto, verify what authentication method(s) has been advertised by the backend server / app:
   - let tran ='TRANSACTION_ID'; // Replace with the TransactionID in the error message

### 关键 KQL 查询
```kql
let tran ='TRANSACTION_ID'; // Replace with the TransactionID in the error message
let transdate = datetime("yyyy-mm-ddThh:mm:ss"); // Replace using the Timestamp in the error message
Traces
| where TIMESTAMP > transdate-30s and TIMESTAMP < transdate+30s  and ( TransactionId == tran or Message contains tran)
| project TIMESTAMP , Message, TransactionId, SubscriptionId
```
`[来源: ado-wiki-b-app-proxy-401-kcd-troubleshooting.md]`

```kql
BootstrapRootOperationEvent
   | where env_time > ago(30m) and subscriptionId == "TENANTID" and connectorId == "CONNECTORID"
   | extend Spnego = extract("'UseSpnegoAuthentication':(.*)", 1, requestString)
   | project env_time, connectorId, connectorVersion, Spnego
```
`[来源: ado-wiki-b-app-proxy-401-kcd-troubleshooting.md]`

---

## Scenario 7: ado-wiki-b-app-proxy-connector-inactive
> 来源: ado-wiki-b-app-proxy-connector-inactive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Possible error events in the [Admin log](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343223/Azure-AD-Application-Proxy-Connector-Event-logs)**
   - 12015 - The Connector failed to establish connection with the service.
   - 12019 - The Connector stopped working because the client certificate is not valid. Uninstall the Connector and install it again.
   - 12020 - The Connector was unable to connect to the service due to networking issues. The Connector tried to access the following URL:
2. **Possible root causes for the 'inactive' status**
   - + Network communication issue
   - + The SSL client certificate expired (could not be renewed)
   - + Instability of the service
3. **Possible Entra Portal issue**
   - The connector(s) does the bootstrap periodically; However, the connector(s) is displayed occasionally as inactive on the portal.
   - a) Use Kusto to check if the affected connector's bootstrap happened continuously in 10-11 mins interval in the reported time period.

---

## Scenario 8: Microsoft Entra Application Proxy - Action Plan Templates for Data Collection
> 来源: ado-wiki-b-app-proxy-data-collection-action-plans.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps:**
   - 1. Create folder (e.g., C:\tracing), extract MEPNCv33.zip
   - 2. Unblock all extracted files (File Explorer > Properties > Unblock)
   - 3. First run `-BPA` to check and fix issues

---

## Scenario 9: Microsoft Entra Application Proxy - Checking Traffic Between Connector and Web App Using Fiddler
> 来源: ado-wiki-b-app-proxy-fiddler-connector-traffic.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Possible Issues**
   - **URL translation loop**: If internal and external URLs differ and "Translate URLs in headers" is set to No, Fiddler may try to establish a session to the external URL, causing a loop
   - **Fiddler resolves the issue**: In some cases, inserting Fiddler in the path may fix the issue being investigated. If so, use alternative tracing methods:
   - WinHttp trace (netsh trace)

---

## Scenario 10: Microsoft Entra Application Proxy - Data Collector Files and Explanation
> 来源: ado-wiki-c-app-proxy-data-collector-files.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 11: Microsoft Entra Application Proxy - Decrypt Traffic Between Connector and Azure
> 来源: ado-wiki-c-app-proxy-decrypt-traffic.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps to Decrypt Traffic**
   - 1. Log in to the server hosting the Connector service as administrator.
   - 2. Download and install **Fiddler Classic**.
   - 3. Locate the file `%ProgramData%\Microsoft\Microsoft Entra private network connector\Config\TrustSettings.xml` and open it.

---

## Scenario 12: Microsoft Entra Application Proxy - Federated Identity Credential (FIC) Auth
> 来源: ado-wiki-c-app-proxy-fic-auth.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Acquire FIC token** using 1pp app and unique id (appid) specified in the Federated credential
- 2. **Use FIC token + OAuth code** to redeem user token
- 1. **AADSTS700020**: Reserved URI used as app identifier URI. FIC token acquisition fails. Secrets auth succeeds.
- 2. **AADSTS70052**: App is multi-tenant. FIC does not support multi-tenant apps.

### 关键 KQL 查询
```kql
// Track addition of FIC to app
UnionAPTables("GraphOperationEvent")
| where env_time > ago(12h)
| where operationName == "MsGraphAddFederatedIdentity" and env_cloud_role == "adminfrontend"
| summarize count() by env_cloud_location, resultType
```
`[来源: ado-wiki-c-app-proxy-fic-auth.md]`

```kql
// App creates/updates that had FIC adds
UnionAPTables("GraphOperationEvent")
| where env_time > ago(12h)
| where operationName == "MsGraphAddFederatedIdentity"
| project-rename trxId=transactionId, addficresult=resultType
| join kind = rightouter
(UnionAPTables("MsgraphApplicationOperationEvent")
| where env_time > ago(12h)
| where SubOperationName in ("AdminUpdateApplication", "AdminCreateApplication")
| where appType == "enterpriseapp"
| project env_time, env_cloud_deploymentUnit, transactionId, resultType)
on $left.trxId==$right.transactionId
```
`[来源: ado-wiki-c-app-proxy-fic-auth.md]`

```kql
// Step 1: Acquiring FIC Token
AadAuthenticationOperationEvent
| where env_time > ago(2h) and operationName == "AcquireTokenForProjectedIdentity"
| where subscriptionId == "<tenantId>"
```
`[来源: ado-wiki-c-app-proxy-fic-auth.md]`

### 相关错误码: AADSTS700020, AADSTS70052

---

## Scenario 13: Microsoft Entra Application Proxy - How to Get the Version of the Connector
> 来源: ado-wiki-d-app-proxy-connector-version-check.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
BootstrapRootOperationEvent
| where env_time > ago(30m) and connectorId == "REPLACE_WITH_CONNECTORID"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```
`[来源: ado-wiki-d-app-proxy-connector-version-check.md]`

```kql
BootstrapRootOperationEvent
| where env_time > ago(30m) and signalingListenerEndpointConnectorGroup == "REPLACE_WITH_CONNECTORGROUPID"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```
`[来源: ado-wiki-d-app-proxy-connector-version-check.md]`

```kql
BootstrapRootOperationEvent
| where env_time > ago(30m) and subscriptionId == "REPLACE_WITH_TENANTID"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```
`[来源: ado-wiki-d-app-proxy-connector-version-check.md]`

---

## Scenario 14: Microsoft Entra Application Proxy - Kusto for Troubleshooting
> 来源: ado-wiki-d-app-proxy-kusto-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Start Kusto Web UX in ASC
- 2. Choose **idsharedweu** and click on Add Cluster
- 3. If 403 error occurs, your TSE account access package may have expired - follow steps in [Access to Advanced Diagnostic Tools](https://dev.azure.com/IdentityCommunities/Community%20-%20Identity%20Di

### 关键 KQL 查询
```kql
let tran='<TransactionID>';
Traces | where (TransactionId == tran or Message contains tran) | project TIMESTAMP, Message
```
`[来源: ado-wiki-d-app-proxy-kusto-troubleshooting.md]`

```kql
TransactionSummaries | where FrontendUrl contains "<ExternalURL>"
```
`[来源: ado-wiki-d-app-proxy-kusto-troubleshooting.md]`

```kql
TransactionSummaries
| where FrontendUrl contains "ExternalURL" and LogicResult != "Success" and TIMESTAMP > ago(4h)
| project TIMESTAMP, TransactionId, ExtraResultData, LogicResult
```
`[来源: ado-wiki-d-app-proxy-kusto-troubleshooting.md]`

---

## Scenario 15: Microsoft Entra Application Proxy - Identifying TLS Inspection
> 来源: ado-wiki-d-app-proxy-tls-inspection-identification.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Resolution**
   - The network device must allow uninspected access to URLs documented in:
   - [How to configure connectors - Allow access to URLs](https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors#allow-access-to-urls)
   - If the customer is not familiar with fixing, their networking team must resolve (worst case, contact the device vendor).

---

## Scenario 16: Setting for a domain user:
> 来源: ado-wiki-e-app-proxy-resource-based-kcd.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1) Register the SPN.
- 2) Configure the SPN for the MEAP app in SSO settings on the Entra Portal.
- 3) Configure the Resource Based Kerberos Constrained Delegation

---

## Scenario 17: ado-wiki-e-app-proxy-spn-kcd
> 来源: ado-wiki-e-app-proxy-spn-kcd.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Diagnosing SPN issues via Network Trace**
   - We can see what SPN is sent in the Kerberos request by capturing a network trace on the Connector server:
   - netsh trace start capture=yes tracefile=C:\Temp\NetTrace.etl

---

## Scenario 18: ado-wiki-e-app-proxy-websocket-troubleshooting
> 来源: ado-wiki-e-app-proxy-websocket-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**

---

## Scenario 19: CAE (Continuous Access Evaluation) Support for App Proxy
> 来源: ado-wiki-f-cae-support-app-proxy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

### 关键 KQL 查询
```kql
AadTokenValidationOperationEvent
| where env_time between (datetime(start) .. datetime(end))
| where ApplicationId == "<ApplicationID>"
| project env_time, transactionId, resultType, resultSignature, resultDescription, TokenType, CaeValidationEnabled
```
`[来源: ado-wiki-f-cae-support-app-proxy.md]`

```kql
AadTokenValidationOperationEvent
| where ApplicationId == "<APPLICATIONID>"
| project env_time, transactionId, resultType, resultSignature, resultDescription, TokenType, CaeValidationEnabled, AuditMode, CapolidsLatebind, CaeEvents
```
`[来源: ado-wiki-f-cae-support-app-proxy.md]`

```kql
Traces
| where TransactionId == "<TRANSACTIONID>"
| project TIMESTAMP, Message, Level
```
`[来源: ado-wiki-f-cae-support-app-proxy.md]`

---

## Scenario 20: Microsoft Entra Application Proxy Connector - High CPU Usage / High Memory Consumption
> 来源: ado-wiki-g-app-proxy-connector-high-cpu-memory.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**

### 关键 KQL 查询
```kql
BootstrapRootOperationEvent
| where env_time > ago(XXh)
| where signalingListenerEndpointConnectorGroup == "CONNECTOR_GROUP_ID"
| extend ConnectorName = extract("'MachineName':(.*)", 1, requestString)
| extend ConnectionLimit = extract(@"ConnectionLimit:'(\d+)", 1, requestString)
| extend CurrentConnections = extract(@"CurrentConnections:'(\d+)", 1, requestString, typeof(int))
| extend CurrentConnections2 = iff(CurrentConnections > -1, CurrentConnections, 0)
| project env_time, CurrentConnections2, ConnectorName, ConnectionLimit
| render linechart
```
`[来源: ado-wiki-g-app-proxy-connector-high-cpu-memory.md]`

```kql
BootstrapRootOperationEvent
| where env_time > ago(XXh)
| where signalingListenerEndpointConnectorGroup == "CONNECTOR_GROUP_ID"
| extend ConnectorName = extract("'MachineName':(.*)", 1, requestString)
| extend ConnectionLimit = extract(@"ConnectionLimit:'(\d+)", 1, requestString)
| project env_time, ConnectionLimit, ConnectorName
```
`[来源: ado-wiki-g-app-proxy-connector-high-cpu-memory.md]`

```kql
let tranTime = datetime("yyyy-mm-ddT00:00:00");
TransactionSummaries
| where TIMESTAMP > tranTime and TIMESTAMP < tranTime + 24h
| where GroupId == "CONNECTOR_GROUP_ID"
| summarize count() by bin(TIMESTAMP, 1s)
| render linechart
```
`[来源: ado-wiki-g-app-proxy-connector-high-cpu-memory.md]`

---

## Scenario 21: Increasing the Maximum Transactions Per Second for Azure AD Application Proxy (HTTP 429)
> 来源: ado-wiki-g-app-proxy-http-429-throttling.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. If only 1-2 apps affected by high traffic, **changing the external URL** of affected apps might help (distributes load)
- 2. If a **software bug** causes the issue, the bug must be fixed
- 3. If this is an **attack**, customer should deploy a firewall (e.g., AFD) in front of the public endpoint to block traffic based on specific conditions

### 关键 KQL 查询
```kql
TransactionSummaries
| where TIMESTAMP > datetime("yyyy-mm-ddT00:00:00") and TIMESTAMP < datetime("yyyy-mm-ddT23:59:59")
| where SubscriptionId == "TENANT_ID"
| where ResponseStatusCode == "429"
| summarize count() by ApplicationId
```
`[来源: ado-wiki-g-app-proxy-http-429-throttling.md]`

```kql
TransactionSummaries
| where TIMESTAMP > datetime("yyyy-mm-ddT00:00:00") and TIMESTAMP < datetime("yyyy-mm-ddT23:59:59")
| where SubscriptionId == "TENANT_ID"
| summarize count() by bin(TIMESTAMP, 1s)
| render timechart
```
`[来源: ado-wiki-g-app-proxy-http-429-throttling.md]`

```kql
TransactionSummaries
| where TIMESTAMP > datetime("yyyy-mm-ddT00:00:00") and TIMESTAMP < datetime("yyyy-mm-ddT23:59:59")
| where SubscriptionId == "Tenant_ID"
| where ResponseStatusCode == "429"
| summarize count() by ExtraResultData
```
`[来源: ado-wiki-g-app-proxy-http-429-throttling.md]`

---

## Scenario 22: Microsoft Entra Application Proxy - Investigating Performance Issues
> 来源: ado-wiki-g-app-proxy-investigating-performance-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Check for errors in Fiddler**
   - Look for HTTP 500, high number of HTTP 401, or other errors that could impact performance. Sort out identified errors first.
2. **Step 2: Add Overall_Elapsed column in Fiddler**
   - **Overall Elapsed** = ClientDoneResponse - ClientBeginRequest
   - Identifies which transactions took longer
   - Note: larger data payloads naturally take longer
3. **Step 3: Use Kusto for transaction analysis**
   - *Look up a specific transaction:**
   - let tran = 'TRANSACTION_ID';
4. **Step 4: Kusto statistics**
   - Create aggregate statistics for latency patterns across time.

### 关键 KQL 查询
```kql
let tran = 'TRANSACTION_ID';
let transdate = datetime("yyyy-mm-ddThh:mm:ss");
TransactionSummaries
| where TIMESTAMP > transdate-10m and TIMESTAMP < transdate+10m and TransactionId == tran
```
`[来源: ado-wiki-g-app-proxy-investigating-performance-issues.md]`

```kql
let tran = 'TRANSACTION_ID';
let transdate = datetime("yyyy-mm-ddThh:mm:ss");
Traces
| where TIMESTAMP > transdate-10m and TIMESTAMP < transdate+10m
  and (TransactionId == tran or Message contains tran)
| project TIMESTAMP, Message, TransactionId, SubscriptionId
```
`[来源: ado-wiki-g-app-proxy-investigating-performance-issues.md]`

---

## Scenario 23: Microsoft Entra App Proxy - Complex App Support
> 来源: ado-wiki-h-app-proxy-complex-app-support.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - See main App Proxy troubleshooting index: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/393136/Azure-AD-Application-Proxy

---

## Scenario 24: Microsoft Entra App Proxy - Header Based Authentication
> 来源: ado-wiki-h-app-proxy-header-based-auth.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - Use ASC to check Published App and Connector configuration
   - Main troubleshooting index: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/393136/Azure-AD-App-Proxy

---

## Scenario 25: Microsoft Entra Application Proxy - Accessing published WebAPI using OAuth 2.0 client credentials fl
> 来源: ado-wiki-i-app-proxy-oauth-client-credentials-flow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In the [Portal](http://portal.azure.com), select **Entra ID**. Then select **Enterprise applications**.
- 2. At the top of the **Enterprise applications - All applications** page, select **New application**.
- 3. On the **Add an application** page, select **On-premises applications**. The Add your own on-premises application page appears.
- 4. If you don't have an **Application Proxy Connector** installed, you'll be prompted to install it. Select **Download Application Proxy Connector** to download and install the connector.
- 5. Once you've installed the Application Proxy Connector, on the **Add your own on-premises application** page:
- 6. On the **Enterprise applications - All applications** page, select the **SecretAPI** app.
- 7. Go to the **SecretAPI - Overview** page, select **Properties** in the left navigation.
- 8. Set **Visible to users** to **No** at the bottom of the **Properties** page, and then select **Save**.
- 9. On the Entra ID **Overview** page, select **App registrations**, search for **SecretAPI**.
- 10. Go to the menu **App roles** and check if you have an enabled role for member types: **Applications**. If not, create one.

---

## Scenario 26: Microsoft Entra Application Proxy - Fiddler Trace Response Headers
> 来源: ado-wiki-j-app-proxy-fiddler-trace-secrets.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 27: Microsoft Entra Application Proxy - GatewayTimeout / NoActiveConnector Troubleshooting
> 来源: ado-wiki-j-app-proxy-gatewaytimeout-connectivity.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**

### 关键 KQL 查询
```kql
BootstrapRootOperationEvent
| where env_time > ago(30m) and subscriptionId == "TENANT_ID" and connectorId == "CONNECTOR_ID"
| extend ServiceBusEndpoints = extract("'SignalingListenerEndpoints':(.*)", 1, responseString)
| project env_time, connectorId, connectorVersion, ServiceBusEndpoints
```
`[来源: ado-wiki-j-app-proxy-gatewaytimeout-connectivity.md]`

---

## Scenario 28: Microsoft Entra Application Proxy - Investigating HTTP 404
> 来源: ado-wiki-j-app-proxy-investigating-http-404.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Checklist**

---

## Scenario 29: Microsoft Entra Application Proxy - Change isBackendCertificateValidationEnabled via MS Graph
> 来源: ado-wiki-k-app-proxy-msgraph-backend-cert-validation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---

## Scenario 30: Microsoft Entra Application Proxy - OpenID Connect (OIDC) SSO for On-Premises Applications
> 来源: ado-wiki-k-app-proxy-oidc-sso-on-premises.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Register OIDC Application with Entra**
   - Register the OIDC application in Entra ID. For testing, use the sample app from GitHub:
   - [Azure-Samples/active-directory-aspnetcore-webapp-openidconnect-v2](https://github.com/Azure-Samples/active-directory-aspnetcore-webapp-openidconnect-v2/tree/master/1-WebApp-OIDC/1-1-MyOrg)
   - Verify the application works from the internal network before proceeding.
2. **Step 2: Publish via Application Proxy**
   - 1. In Entra portal, open the application and select **Application Proxy**
   - 2. Set the **Internal URL** for the application (upload TLS/SSL cert if using custom domain)
   - 3. Set **Pre Authentication** to **Entra ID**
3. **Troubleshooting**
   - If App Proxy setup has issues, see: [Troubleshoot Application Proxy problems and error messages](https://docs.microsoft.com/azure/active-directory/app-proxy/application-proxy-troubleshoot)
   - Sample Fiddler traces (internal and external through MEAP) are available for reference

---

## Scenario 31: ado-wiki-m-app-proxy-stop-data-collector-on-string-match
> 来源: ado-wiki-m-app-proxy-stop-data-collector-on-string-match.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Create the directory for storing the data (e.g. C:\MSLOGS)
   - 2. Download MEPCTraceStopv1.zip and extract into C:\MSLOGS
   - 3. Start data collection: `.\ME-AP-tracingVXX.ps1 -Path C:\MSLOGS -ServiceTraceOn` (**Only if needed!**)

---

## Scenario 32: ado-wiki-m-app-proxy-troubleshooting-helper-scripts
> 来源: ado-wiki-m-app-proxy-troubleshooting-helper-scripts.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 33: ado-wiki-m-app-proxy-using-asc-for-config
> 来源: ado-wiki-m-app-proxy-using-asc-for-config.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Go to **Azure Support Center** (launch from Service Desk or use `https://azuresupportcenter.msftcloudes.com/caseoverview` with the case number)
   - 2. Click on **Tenant Explorer's icon** on the left
   - 3. After Tenant Explorer loads, click on **AAD Application Proxy** in the left menu

---

## 附录: Kusto 查询参考

### gateway-throttle
> AAD Gateway 节流检测查询

```kql
union cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').table('RequestSummaryEventCore'), 
      cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('AADGatewayProd').table('RequestSummaryEventCore')
| where env_time > ago(1d)
| where AdditionalParameters has "ThrottleEnforcement"
| where TargetTenantId == "{tenantId}"
| take 1000
```

```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| project env_time, EffectiveStatusCode, ClientRequestId, TargetService, IncomingUrl, IsThrottled
```

```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| summarize 
    TotalRequests = count(),
    ThrottledCount = countif(IsThrottled == true),
    BlockedCount = countif(IsBlocked == true)
| extend ThrottleRate = round(100.0 * ThrottledCount / TotalRequests, 2)
```

---