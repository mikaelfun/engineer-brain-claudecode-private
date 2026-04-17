# ENTRA-ID Microsoft Graph API — Detailed Troubleshooting Guide

**Entries**: 204 | **Drafts fused**: 42 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-graph-managing-consent.md, ado-wiki-a-graph-managing-directory-extensions.md, ado-wiki-a-graph-managing-directory-roles.md, ado-wiki-a-graph-managing-licenses.md, ado-wiki-a-graph-managing-mfa-scenarios.md, ado-wiki-a-lab-microsoft-graph-dotnet-webhooks.md, ado-wiki-a-ms-graph-api-tsg.md, ado-wiki-a-ms-graph-endpoint.md, ado-wiki-a-ms-graph-powershell-bodyparameter.md, ado-wiki-a-ms-graph-powershell-usage.md
**Generated**: 2026-04-07

---

## Phase 1: Graph Api
> 40 related entries

### Get-MgUser with filter on signInActivity/lastSignInDateTime returns 400 Bad Request error: 'Number of included identifiers cannot exceed 1000'. Exa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Per PG confirmation: when querying users and filtering last sign-in activity, the reporting API is called first, followed by MSODS. The reporting API may incorrectly paginate the response and return more than 1000 results to MSODS, which then returns 400 Bad Request. PG is aware but no fix ETA.

**Solution**: Use Invoke-MgGraphRequest with manual pagination instead of Get-MgUser -Filter. Connect with AuditLog.Read.All,Directory.Read.All,User.Read.All scopes, query https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,displayName,signInActivity&$top=500 with ConsistencyLevel=eventual header, iterate @odata.nextLink, then filter results client-side using Where-Object.

---

### Get-MgUser with signInActivity/lastSignInDateTime filter returns 400: Number of included identifiers cannot exceed 1000.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PG confirmed: reporting API may incorrectly paginate and return >1000 results to MSODS, triggering 400 Bad Request. No fix ETA.

**Solution**: Use Invoke-MgGraphRequest with manual pagination: /v1.0/users?$select=userPrincipalName,displayName,signInActivity&$top=500, ConsistencyLevel=eventual header, iterate @odata.nextLink, filter client-side.

---

### Graph API $select parameter returns no data on /groups navigation property endpoints (e.g. /groups/{id}/members?$select=displAYname) when property ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: For navigation properties typed as directoryObject, properties are dynamic per OData spec and forwarded as-is to backend (case-sensitive). Only properties defined in the entity schema (e.g. on user/group directly) are case-insensitive.

**Solution**: Use exact CSDL-defined casing for $select on navigation properties (e.g. 'displayName' not 'displAYname'). This affects /groups/{id}/members, /users/{id}/memberOf, /applications/{id}/owners and similar navigation properties.

---

### HTTP 403 Access Denied when adding guest user to M365 group via Graph API. MSODS log shows 'Group does not allow guests in group' and 'Guests users...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AllowToAddGuests group setting is set to false either at tenant level (directory settings) or at the specific group level, blocking guest additions regardless of API permissions.

**Solution**: 1) Check tenant-level directory settings: GET group settings and inspect AllowToAddGuests value. 2) If tenant-level is true, check group-level setting. 3) Update setting via Graph: follow MS Learn docs for reading/updating directory settings at tenant or group level. Use PowerShell Connect-MgGraph or Graph API PATCH to set AllowToAddGuests=true.

---

### 422 MissingPrefixSuffix error when creating M365 group from My Groups Portal (myaccount.microsoft.com/groups) when naming policy prefix contains / ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: directoryObject/validateProperties API strips / character from mailNickname during validation, causing mismatch with the group naming policy prefix. Bug under investigation - docs list invalid chars but / is not included.

**Solution**: Workaround: Create M365 groups via Outlook Desktop Application or Outlook Web Access instead of My Groups Portal. Investigation ongoing: Bug 2840960 tracking whether docs need update or code needs fix. Related CRI: ICM 469840735.

---

### Group overview page in Azure portal shows incorrect member count for extremely large groups. Graph /groups/{id}/members/$count returns 503 Service ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Backend service limitation: Mezzo service times out when processing membership count queries for extremely large groups. Error: 'DirectoryServiceUnavailableException: Timeout getting response from Mezzo'. Cross-team work item in progress.

**Solution**: Use PowerShell to enumerate and count members: Connect-MgGraph -Scopes 'Directory.Read.All'; $members = Get-MgGroupMember -GroupId {id} -All -Select displayName,mail,userType; $members.Count. May take several minutes for very large groups. Related ICM: 457793643.

---

### Directory_ExpiredPageToken error when using skipToken from Graph /groups?$filter=assignedLicenses/any(x:x/skuId eq {guid}) query. Token expires imm...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known bug in Graph/directory backend. Tracked at Bug 1728776.

**Solution**: No workaround currently available. Bug 1728776 is tracking the fix. Consider using alternative approaches: enumerate all groups then filter client-side, or use PowerShell Get-MgGroup with -Filter.

---

### Non-admin group owner gets HTTP 403 when calling Graph /groups/{id}/members if the group has another group as a nested member
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group owner has permission to read direct members but lacks permission to read nested child group objects. The API fails when it encounters a member object (nested group) the caller can't access.

**Solution**: Grant owner additional directory read permissions (e.g. Directory.Read.All), or use admin-level credentials for the API call. Reference: Troubleshooting 403 incidents TSG at eng.ms. ICM: 424578693.

---

### Internal server error (500) when PATCH-ing group settings DefaultClassification value via Graph API. MSODS shows KeyNotFoundException in ValidateAn...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ValidateAndTrimDefaultClassification function validates the PATCH-ed DefaultClassification value against the ClassificationList. If the value is not present in ClassificationList, it throws KeyNotFoundException causing 500 error.

**Solution**: When setting DefaultClassification, ensure the value exists in ClassificationList. Set both DefaultClassification and ClassificationList together in the same PATCH request body to avoid validation failure.

---

### Graph API select parameter returns no data on /groups navigation property endpoints when property name casing does not match CSDL schema
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: For navigation properties typed as directoryObject, properties are dynamic per OData spec and forwarded as-is to backend (case-sensitive). Only schema-defined properties are case-insensitive.

**Solution**: Use exact CSDL-defined casing for select on navigation properties. Affects /groups/{id}/members, /users/{id}/memberOf, /applications/{id}/owners.

---

## Phase 2: Ms Graph
> 33 related entries

### Microsoft Graph permission GUIDs (e.g., TeamworkTag.ReadWrite.All) differ between commercial and government (USGov/GCC) clouds, causing permission ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MS Graph GUIDs were assigned randomly during onboarding for each cloud. No requirement for consistency between clouds, so most GUIDs do not match.

**Solution**: Use PowerShell to query correct GUIDs from target government tenant: Connect-MgGraph -Environment USGov, then Get-MgServicePrincipal to list Graph permissions with correct GUIDs. Do not use commercial cloud documentation GUIDs for government tenants.

---

### Microsoft Graph API returns 401 InvalidAuthenticationToken with message: Continuous access evaluation resulted in claims challenge with result: Int...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The access token is presented from a different IP address than where it was originally requested, and the new IP is blocked by a Conditional Access location policy. Common cause: split tunneling where login.microsoftonline.com and graph.microsoft.com traffic go through different gateways

**Solution**: 1) Have user sign out and sign in again to get a fresh token from the correct IP. 2) If recurring, verify network configuration - ensure all Microsoft traffic goes through the same gateway (no split tunneling). The WWW-Authenticate header contains xms_rp_ipaddr showing the IP seen by Graph.

---

### Azure Identity SDK-based clients (Azure CLI, Azure PowerShell, MS Graph PowerShell, Python SDK) receive unexpected CAE claim challenge errors from ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure Identity SDK automatically includes the cp1 client capability in token requests, causing Azure AD to issue long-lived CAE tokens (20-28 hours). When CAE events occur, Graph returns claim challenges that the non-CAE-capable client cannot handle.

**Solution**: Set environment variable AZURE_IDENTITY_DISABLE_CP1=true. Per-platform: MS Graph PowerShell: Disconnect-MgGraph, Remove-Item $env:USERPROFILE\.graph -Recurse -Force, reconnect. Python/CLI: export AZURE_IDENTITY_DISABLE_CP1=true. Java: System.setProperty("AZURE_IDENTITY_DISABLE_CP1", "true"). .NET: Environment.SetEnvironmentVariable("AZURE_IDENTITY_DISABLE_CP1", "true"). Java Graph SDK: pass false for isCAEEnabled in AzureIdentityAuthenticationProvider constructor.

---

### Microsoft Graph .NET SDK always returns a successful status code for long-running operations (e.g., resetPassword API) without providing the async ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The MS Graph .NET SDK does not support the longRunningOperation resource type, so it cannot automatically follow the Location header to track async operation status.

**Solution**: Use the built-in HeadersInspectionHandlerOption with InspectResponseHeaders=true to capture the Location header from the response, then manually poll that URL for operation status.

---

### MS Graph delta query for groups returns the same groups multiple times with empty values across pages; query appears to never end returning only ne...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design - internal USN watermark enumeration mechanism causes objects to re-emerge across pages when enumerating link changes (e.g., members). Overlapping watermark ranges produce duplicate objects in consecutive pages

**Solution**: Set $top parameter to 999 to reduce pagination. Set Prefer header to 'return=minimal' to return only groups with changed properties. Keep following nextLinks until deltaLink appears - eventual convergence is guaranteed

---

### MS Graph riskDetection/riskyUsers/signIns API queries using deprecated riskType enum property return errors or unexpected results
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft deprecated riskType enum property (deprecated 9/9/2020) and replaced it with riskEventType string property. For signIns API, riskEventTypes enum replaced with riskEventTypes_v2 string

**Solution**: For Identity Protection APIs (riskDetection/riskyUserHistoryItem): use riskEventType (string) instead of riskType (enum). For signIns API: use riskEventTypes_v2 (string) instead of riskEventTypes (enum). Update search logic to match string values instead of numeric enum values. Use v1.0 endpoint as riskEventType is transitioning from beta to v1.0

---

### MS Graph API returns 'Insufficient privileges to complete the operation' despite having correct permissions consented
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Access token was issued before permissions were consented; the cached token does not contain the newly granted permissions. For managed identities, tokens are cached for 24 hours and cannot be refreshed

**Solution**: Acquire a new access token after consent is granted. For managed identities, wait 24 hours for token cache to expire. Also check if user has PIM-activated role - verify the admin role GUID appears in the 'wids' claim of the access token

---

### MS Graph returns 'Insufficient privileges' when updating sensitive user properties (accountEnabled, businessPhones, mobilePhone, passwordProfile, u...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Sensitive user properties require additional specific API permissions beyond User.ReadWrite.All (e.g., User.EnableDisableAccount.All for accountEnabled, User-Phone for phone numbers, User-PasswordProfile for password, Directory.AccessAsUser.All for immutableId)

**Solution**: Grant the specific additional permission for the sensitive property being updated. Refer to the sensitive actions permissions table at https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#who-can-perform-sensitive-actions

---

### Failed to delete application in Entra ID - 'Insufficient privileges to complete the operation' - application shows 'This application has been disab...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application was disabled by Microsoft due to violation of services agreement (DisabledByMicrosoftStatus=2, IsDisabled=true). Created by compromised user or linked to malicious activity. Global Administrator cannot delete these apps

**Solution**: Application cannot be deleted while in disabled state. Verify DisabledByMicrosoftStatus property in app manifest or via MSODS Explorer. The app cannot be used to authenticate while disabled. PG will not share detection details for security reasons. Refer customer to Identity Protection for Workload Identities documentation

---

### MS Graph returns 'Insufficient privileges' when using addKey/removeKey APIs with delegated permissions
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: addKey and removeKey APIs do not support delegated permissions - only application permissions are supported

**Solution**: Use application permissions (app-only token) instead of delegated permissions for addKey/removeKey operations. See IcM 690700259 for details

---

## Phase 3: Entra Id
> 11 related entries

### Graph API PATCH to update onPremisesExtensionAttributes on a cloud-only user (with EXO license) returns Request_BadRequest: 'Unable to update the s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user existed during a DirSync disablement (authority transfer), which stamped _SingleAuthorityMetadata with ExchangeMastered=True on all objects including cloud-only ones. This incorrectly blocks Graph from updating onPremisesExtensionAttributes, treating them as externally-mastered.

**Solution**: Workaround: update extension attributes from EXO side using Exchange PowerShell: Set-MailUser -Identity <user> -CustomAttribute<N> 'value'. The value will be forward-synced to Entra ID. Permanent fix pending PG work item (ADO #1908437) to remove multi-authority properties.

---

### Using resourceScopes attribute in Unified RBAC API role assignment requests returns deprecation warning or unexpected behavior
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The resourceScopes attribute is deprecated in the Unified RBAC API and will be removed in a future version.

**Solution**: Use directoryScopeId or appScopeId instead of resourceScopes. directoryScopeId references Azure AD objects (tenant, admin units, groups), e.g. "/" for tenant-wide. appScopeId references application-specific scopes native to non-AAD RBAC providers like Intune.

---

### Permission error (403 Forbidden or Insufficient privileges) when managing Azure AD roles via application using Unified RBAC API in delegated flow
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: In delegated flow, effective permission is the intersection of user permissions and app permissions. The user must have Privileged Role Admin (or Global Admin) AND the app must have RoleManagement.ReadWrite.Directory or Directory.ReadWrite.All scope granted.

**Solution**: Ensure the signed-in user has Privileged Role Admin or Global Admin role. Grant the application either RoleManagement.ReadWrite.Directory or Directory.ReadWrite.All OAuth scope. For Intune/Exchange workloads, use the corresponding workload-specific permissions.

---

### Subscription validation request failed. Error: Notification endpoint must respond with 200 OK to validation request when creating Microsoft Graph w...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The notificationUrl endpoint does not correctly respond to the validation POST request from Microsoft Graph. The endpoint must return HTTP 200 with the validationToken value in the response body as text/plain within 10 seconds.

**Solution**: 1) Verify notificationUrl is accessible from public internet (private networks not supported). 2) Test: POST to {notificationUrl}?validationToken=1234, should return 1234 as text/plain with 200 OK. 3) Ensure response within 10 seconds. 4) Allow inbound traffic from Microsoft Graph Change Notifications IP addresses.

---

### 403 Forbidden error when creating Microsoft Graph webhook subscription for Azure AD resources (users, groups) due to subscription quota limits exce...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD subscription quota limits exceeded. Limits: per app = 50,000 subscriptions; per tenant = 1,000 subscriptions across all apps; per app+tenant combination = 100 subscriptions.

**Solution**: Review and clean up existing subscriptions using GET /subscriptions. Delete unused subscriptions to free up quota. Consider consolidating subscriptions where possible.

---

### Microsoft Graph subscription request fails when using Outlook resource path with a UPN containing an apostrophe (e.g., /users/sh.o'neal@contoso.com...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: UPN containing apostrophe in the resource path causes subscription request failure for Outlook resources (messages, events, contacts). This is a known limitation.

**Solution**: Use GUID user ID instead of UPN in the resource path. Example: use /users/{guid-user-id}/messages instead of /users/sh.o'neal@contoso.com/messages.

---

### Microsoft Graph change notifications stop being delivered after TLS 1.0/1.1 deprecation. Subscription latestSupportedTlsVersion shows TLS 1.0 or 1.1.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The notification endpoint uses TLS 1.0 or 1.1, which are deprecated. Microsoft Graph requires TLS 1.2 or later for notificationUrl endpoints.

**Solution**: Update the notification endpoint to support TLS 1.2 or later. Check the latestSupportedTlsVersion property on the subscription object to verify TLS version compatibility.

---

### Delta query returns HTTP 501 Not Implemented when using $select with properties stored outside the main data store (e.g., user skills property)
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Some resource properties are stored outside the main data store (e.g., user skills is in SharePoint Online, not Azure AD). Delta query only tracks changes for properties in the main data store.

**Solution**: Test property support by performing a regular GET on the resource collection with $select for that property. If 501 is returned, the property is not supported for delta query. Use alternative sync mechanisms for such properties.

---

### Delta query stops returning changes or deltaLink/deltaToken becomes invalid after approximately 30 days for Azure AD identity objects (users, group...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Delta tokens for identity objects (directoryObject, directoryRole, group, user) are valid for only 30 days. After expiration, the token is no longer usable and the client must perform a full resync.

**Solution**: Implement token expiration handling: when a delta token expires, perform a full synchronization by calling the delta function without a deltaToken. Schedule periodic delta query calls within the 30-day window to maintain a valid token chain.

---

### Admin user gets 403 error when calling UserAuthenticationMethods Graph API or viewing user authentication methods in portal. mysecurityinfo cannot ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: User or group is assigned to Microsoft Graph service principal (appId 00000003-0000-0000-c000-000000000000) with appRoles. Access token contains both roles and scp claims. When both present, Graph API uses intersection to check access, resulting in 403.

**Solution**: Check Graph SP appRoleAssignedTo: GET /servicePrincipals(appId='00000003-0000-0000-c000-000000000000')/appRoleAssignedTo?$top=200&$count=true. Either add proper role assignments or remove all appRole assignments for the affected user/group.

---

## Phase 4: Reporting Api
> 5 related entries

### Microsoft Graph Reporting API (auditLogs/signIns, directoryAudits) returns 403 Forbidden. Sub-errors include: 'Neither tenant is B2C or tenant does...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple causes: (1) Tenant lacks Azure AD Premium P1/P2, (2) B2C tenant not supported, (3) User not in required admin role, (4) App missing AuditLog.Read.All or Directory.Read.All permission, (5) Permission not admin-consented.

**Solution**: Verify P1/P2 license. Assign admin role (Security Admin/Reader, Global Reader, Report Reader). Add AuditLog.Read.All + Directory.Read.All for app-only. Grant admin consent. Check scp/roles claim in token.

---

### Microsoft Graph Reporting API returns 'Token not found: token is either invalid or expired' when paginating auditLogs results using skiptoken conti...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Skiptokens expire within 5-10 minutes of issuance. Slow pagination causes token expiry.

**Solution**: Implement exponential retry: 1s, 2s, 4s, 8s, 16s. Process pages within 5-10 min. Reduce result set with $top/$filter to speed pagination.

---

### Microsoft Graph Reporting API (auditLogs/signIns) returns fewer results than Azure portal or missing entries. Non-interactive sign-ins not appearin...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple causes: (1) Audit log latency up to 2 hours, (2) v1.0 only shows interactive sign-ins, (3) userPrincipalName filter is case-sensitive causing mismatches.

**Solution**: Allow 2hr propagation delay. Use beta endpoint with signInEventTypes/any(t:t eq 'nonInteractiveUser') for non-interactive. Use startsWith(userPrincipalName,...) instead of eq for case-insensitive matching.

---

### Get-AzureADAuditSignInLogs or Graph API filtering by userPrincipalName returns no results when UPN contains uppercase letters.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UPN filtering is case sensitive and UPNs are stored in lowercase in the database.

**Solution**: Use all lowercase for UPN filters. PowerShell: $upn = "UPN".ToLower(). Graph API: use tolower() in filter. E.g., $filter=userPrincipalName eq tolower("John.Smith@contoso.com").

---

### Gateway Timeout (HTTP 504) when calling Get-AzureADAuditSignInLogs, loading sign-in logs in portal, or using Graph API. Azure Gateway returns 504 a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Large queries to the reporting database experience longer processing times, especially with large event volumes.

**Solution**: Modify query filter to reduce returned events. Use shorter createdDateTime ranges. Iterate through timespan. Check Gateway logs: cluster(aadgwwst).database(AADGatewayProd).AllRequestSummaryEvents.

---

## Phase 5: User Management
> 5 related entries

### Failed to update user with 403 Forbidden via Microsoft Graph despite having User.ReadWrite.All or Directory.ReadWrite.All, when modifying sensitive...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Sensitive user properties (accountEnabled, mobilePhone, otherMails) for users with privileged admin roles require the calling principal to have a higher privileged administrator role. MSODS IfxBECAuthorizationManager log shows task DENIED (e.g. SetUserMobileProperty).

**Solution**: For delegated scenarios: assign Directory.AccessAsUser.All permission and ensure calling user has higher privileged admin role than target user (per 'Who can perform sensitive actions' docs). For app-only scenarios: assign the app a higher privileged admin role. Use MSODS IfxBECAuthorizationManager Kusto query to identify which specific task was DENIED.

---

### 403 Forbidden error when updating onPremisesImmutableId attribute via Microsoft Graph API or Update-MgUser PowerShell cmdlet
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Updating onPremisesImmutableId is classified as a sensitive action (UpdateSourceAnchorOnDirSyncUser task). For cloud-only users, appropriate admin roles + permissions are needed. For synced users, only Global Administrator can perform this update.

**Solution**: For cloud-only users: use User.ReadWrite.All application permission (app-only) or Directory.AccessAsUser.All delegated permission with appropriate admin role per sensitive actions table. For synced users: only Global Administrator can update. When using Update-MgUser, pass scope Directory.AccessAsUser.All to use UserIdentity flow.

---

### Error 'One or more property values specified are invalid' when PATCHing a value to a custom extension property via Microsoft Graph or Update-MgUser...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The extension property (e.g. extension_<appid>_jobGroup) is defined as multivalued (isMultiValued=true), but a single string value is passed instead of an array in the API request.

**Solution**: Pass an array instead of a single string. PowerShell: Update-MgUser -UserId <id> -AdditionalProperties @{'extension_<appid>_prop' = @('value')}. MS Graph REST: pass JSON array in request body for the extension property value.

---

### Cloud-only user without Exchange Online license has unwanted proxyAddress that cannot be removed through standard Azure AD portal. User is not mail...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ProxyAddress management for cloud-only unlicensed users is not exposed in standard admin UI. ProxyCalc may re-add addresses if UPN-based proxy is removed. v1.0 Graph API does not support PATCH on proxyAddresses; only beta endpoint works.

**Solution**: Option 1 (preferred): Use MS Graph Beta endpoint - PATCH https://graph.microsoft.com/beta/users/{id} with body {"proxyAddresses": ["SMTP:keep@domain.com"]} containing only addresses to keep. Requires Global Admin + User.ReadWrite.All. Option 2: Create dummy user, soft-delete target user, set dummy's mail to unwanted proxy, restore target with Restore-EntraDeletedDirectoryObject -AutoReconcileProxyConflict. Note: verify user has no Exchange plans enabled and RemoteRecipientType is NULL.

---

### Domain name filter in Entra Admin Center Users blade does not return users whose alternate email addresses match the searched domain.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The domain name filter only searches User principal name (UPN) and Mail properties. It does not search Alternate emails or other identity properties.

**Solution**: Known limitation. Use Microsoft Graph API with $filter to search otherMails. Example: GET /users?$filter=otherMails/any(m:endsWith(m,'@contoso.com'))

---

## Phase 6: Aad Graph
> 4 related entries

### Application calls to Azure AD Graph API (graph.windows.net) fail with errors after retirement stage 1 (Sep 2024)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD Graph API service (graph.windows.net) deprecated since June 2020, Stage 1 retirement began September 1, 2024

**Solution**: Migrate application to Microsoft Graph API. For temporary unblocking, use App Registration setting to re-enable AAD Graph access. See internal doc: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1631982/Unblock-AAD-Graph-APIs-in-App-Registrations

---

### Application receives 403 Forbidden with description 'Access blocked to AAD Graph API for this application' after Azure AD Graph retirement enforcem...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD Graph API (graph.windows.net) is being retired in phases. Phase 1 blocks new apps, Phase 2 blocks all apps without blockAzureADGraphAccess=false extension, Phase 3 permanently blocks all apps including those with extensions.

**Solution**: For Phase 1/2: Set blockAzureADGraphAccess to false via authenticationBehaviors property using MS Graph API or Graph Explorer to get temporary extension. For Phase 3 (permanent): Must migrate to Microsoft Graph API. Check Entra Recommendations for impacted apps. For AzureAD PowerShell: migrate to Microsoft Graph PowerShell SDK or Microsoft Entra PowerShell.

---

### PATCH to passwordCredentials via AAD Graph API (graph.windows.net) fails with Request_BadRequest 'Property identifierUris is invalid' when trying t...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AAD Graph is deprecated; generating custom password credentials (setting your own password value) is no longer supported when the application has an App URI ID configured or is not set as a confidential client.

**Solution**: Long-term: Migrate to MS Graph addPassword API (POST /applications/{id}/addPassword) which generates a random client secret. Short-term workaround: either enable the app as Confidential client, or remove the App URI ID from the application registration.

---

### Need to identify all applications using AAD Graph API in a tenant for deprecation/migration to Microsoft Graph
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AAD Graph API is deprecated; applications still using it need to be identified and migrated to Microsoft Graph

**Solution**: Use Kusto query on msodsuswest.kusto.windows.net/msods: GlobalIfxRestBusinessCommon filtering by contextId, env_time, clientVersion not internal, directAccessSource=Gateway, firstPartyServicePrincipal=false, then distinct applicationId

---

## Phase 7: Enterprise App
> 4 related entries

### Enterprise Apps filter "Assignment Required = Not required" in Azure Portal shows fewer apps than Excel export with same filter
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal requires ExplicitAccessGrantRequired to be explicitly set to false. If property is missing, app is excluded. Excel treats missing property as false.

**Solution**: Use MS Graph API: GET /servicePrincipals?$filter=appRoleAssignmentRequired -ne true (includes SPs with missing property). Or export to Excel and filter there.

---

### Unable to assign groups to Enterprise Application - error "Groups are not available for assignment due to your Active Directory Plan level" despite...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in license check for group assignment in Enterprise Apps (Bug 3333754). No ETA for fix.

**Solution**: Use Microsoft Graph API as workaround for group assignment.

---

### Enterprise Apps Assignment Required filter shows fewer apps in Portal than Excel export
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal requires ExplicitAccessGrantRequired explicitly false. Missing property excludes app. Excel treats missing as false.

**Solution**: Use Graph API: GET /servicePrincipals?$filter=appRoleAssignmentRequired -ne true.

---

### Unable to assign groups to Enterprise App despite P1/P2 license
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in license check (Bug 3333754). No ETA.

**Solution**: Use Microsoft Graph API for group assignment.

---

## Phase 8: Mfa
> 4 related entries

### User has 5 Microsoft Authenticator apps or hardware tokens registered and can no longer log in or register a new Authenticator app; receives messag...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD enforces a hard limit of 5 Microsoft Authenticator app registrations per user account; there is no portal UI for admins to remove individual authenticator app method entries

**Solution**: Admin uses Microsoft Graph API: (1) GET https://graph.microsoft.com/beta/users/{upn}/authentication/microsoftAuthenticatorMethods to list devices; (2) DELETE the same URL with appended /{id} to remove the old registration. Requires UserAuthenticationMethod.ReadWrite.All permission in Graph Explorer

---

### Users see additional/unexpected MFA prompts when managing authentication methods via Microsoft Graph API or the credential management page (mysigni...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft rolled out a security update (Jan 26 - Feb 6, 2026) requiring MFA completion within the last 10 minutes for managing authentication methods programmatically via Microsoft Graph authenticationMethods API. Users already registered for MFA will see more frequent MFA prompts for sensitive credential management operations.

**Solution**: For developers: handle 403 responses by initiating a new interactive OAuth 2.0 authorization request with claims parameter {"access_token":{"amr":{"essential":true,"values":["ngcmfa"]}}}. Retry the credential management request with the newly issued access token. For end users: reauthenticate when prompted; users managing methods via aka.ms/mysecurityinfo are already subject to MFA and need no changes.

---

### Admin clicks Revoke MFA sessions for a user but it has no effect - action returns success without actually revoking MFA sessions. Affects users wit...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Revoke MFA sessions is a legacy capability tied only to per-user MFA enforcement. For CA-based MFA users, the portal previously returned success without performing actual revocation. Bug corrected late 2025; portal now returns proper error for CA users. Starting Feb 2026, button replaced by Revoke sessions.

**Solution**: Use Revoke sessions instead (Users blade > select user > Overview > Revoke sessions), which invalidates all sessions including MFA regardless of enforcement method (CA or per-user). For API: use Graph revokeSignInSessions: POST /v1.0/users/{id}/revokeSignInSessions. The legacy Revoke MFA sessions button will be replaced by Revoke sessions starting Feb 2026.

---

### Cannot set up MFA - error: You cannot have more than 5 hardware tokens or authenticator apps. You have too many devices registered
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Maximum of 5 device tokens already persisted in StrongAuthenticationPhoneAppDetail property of the directory user object

**Solution**: Solution 1: Delete sign-in methods at https://aka.ms/mysecurityinfo (admin may need to set Require re-register MFA first). Solution 2: Use Graph API - GET /beta/users/{upn}/authentication/microsoftAuthenticatorMethods to list, then DELETE each authenticator by ID

---

## Phase 9: App Management Policy
> 3 related entries

### App management policy for password restriction not working; passwordAdditionExempted Custom Security Attribute created with Boolean type instead of...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in Portal UI creating CSA with wrong data type (fixed in Oct 2025 Bug 3410200). Tenants affected before fix still have wrong type.

**Solution**: Create a new CSA set and attribute with String type and include it in Default App Management policy through Graph API. May need PG assistance to change data type of existing CSA.

---

### App management policy for password restriction not working; CSA created with Boolean instead of String type
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal UI bug creating CSA with wrong data type (fixed Oct 2025). Pre-fix tenants still affected.

**Solution**: Create new CSA set with String type via Graph API.

---

### App Management Policy portal error: The restriction have been modified outside of this interface. Editing disabled until restrictions synchronized.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Policy was configured via Graph API or PowerShell, causing settings across passwordCredentials/keyCredentials collections to be misaligned with what the Entra portal UX expects.

**Solution**: Use Graph Explorer to manually align settings across all four collections (applicationRestrictions.passwordCredentials, servicePrincipalRestrictions.passwordCredentials, etc.). Ensure restrictForAppsCreatedAfterDateTime and maxLifetime values match.

---

## Phase 10: Conditional Access
> 3 related entries

### Excluded users list in a Conditional Access policy does not enumerate in the Azure portal; unable to add or remove excluded users from the policy.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Duplicate user object IDs in the excluded users list cause the portal UI enumeration to fail.

**Solution**: 1. Find CA policy ID: GET https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies. 2. Get policy details: GET https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/{id}. 3. Identify duplicate object IDs in excludeUsers. 4. PATCH to remove duplicates: PATCH https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/{id} with only conditions.users.excludeUsers in the body. HTTP 204 = success. Excluded users list will then enumerate normally in portal.

---

### Application calling MS Graph is unexpectedly evaluated by CA policies targeting Exchange Online or other Office 365 services, causing access blocks...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MS Graph scopes (e.g. Tasks.Read) are internally mapped to underlying service APIs (e.g. Exchange Online for Tasks). When a client app requests these scopes, both MS Graph and the mapped service resource AppIDs are evaluated against CA policies.

**Solution**: Check app required MS Graph scopes in ASC (under AppID 00000003-0000-0000-c000-000000000000). Use Auth Troubleshooter diagnostic logs (Expert view) to identify scope-to-service mapping. Translate scope GUIDs by looking up MS Graph app. Consider using combined Office 365 app group in CA policy.

---

### Conditional Access policies using networkAccess or globalSecureAccess settings in Graph API need migration due to deprecation of these properties
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft consolidating CA Target Resources assignments from 'Cloud apps' and 'Global Secure Access' into new 'Resources' category. The networkAccess and globalSecureAccess beta API settings are deprecated.

**Solution**: Migrate to new Global Secure Access App IDs. Editing and saving a policy in the Entra admin center automatically updates the schema. Avoid creating new policies with deprecated settings.

---

## Phase 11: Aad Graph Retirement
> 3 related entries

### AzureAD PowerShell module commands (Connect-AzureAD, Get-AzureADUser, etc.) fail permanently after Phase 3 retirement enforcement for non-S500 tena...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AzureAD PowerShell is permanently blocked for non-S500 tenants as part of AAD Graph retirement Phase 3. The module relied on Azure AD Graph APIs.

**Solution**: Migrate to Microsoft Graph PowerShell SDK or Microsoft Entra PowerShell. Use compatibility mode (Enable-EntraAzureADAlias) for interim. Run az account clear after setting blockAzureADGraphAccess to force token refresh.

---

### Customer receives alert 'Migrate Microsoft first-party apps from the retiring Azure AD Graph APIs to Microsoft Graph' for 1st party applications th...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Engineering change Dec 2024 generated alerts for 1P Microsoft-owned apps. Fix deployed 12/9/2024 to hide non-actionable 1P apps.

**Solution**: MS 1P apps have extensions configured and will not be impacted. Use email template from wiki. Verify if truly 1P via verifiedPublisher or app ID list. Handle in originating queue.

---

### Azure AD Graph API calls fail with HTTP 403 'Access blocked to AAD Graph API for this application' during Phase 3 permanent enforcement, even when ...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Phase 3 permanent enforcement of AAD Graph retirement ignores the blockAzureADGraphAccess authenticationBehaviors setting. Unlike Phase 2 where setting the flag to false allowed continued use until the cutoff, Phase 3 permanently blocks all AAD Graph API access regardless of configuration.

**Solution**: Migrate applications to Microsoft Graph API immediately. blockAzureADGraphAccess can no longer be used for recovery in Phase 3. Check Entra Recommendations to identify impacted apps. For AzureAD PowerShell, migrate to MS Graph PowerShell SDK or Entra PowerShell. For Azure CLI, update to v2.66.0+.

---

## Phase 12: B2C
> 3 related entries

### Error AADB2C95032: Cannot mix RSA and Oct types in one key set when managing B2C Trust Framework KeySets via Graph API
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Attempting to mix different key types (RSA and Oct) in a single Trust Framework key set

**Solution**: Ensure each key set contains only one key type - either RSA or Oct. Create separate key sets for different types

---

### Error uploading PKCS12 key to B2C Trust Framework KeySet via Graph API - value must not be null or white space for password
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PKCS12 certificate key uploaded without providing the required password parameter

**Solution**: Include the PKCS12 password when uploading the key via Graph API Trust Framework KeySet endpoint

---

### Error AADB2C90136: request is missing parameters or has wrong parameter when using B2C Trust Framework Graph APIs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Required parameters missing or incorrect in Graph API request for Trust Framework operations

**Solution**: Check error message body for parameter details. Import Base and BaseExtension policies before dependent files. Ensure KeySet exists before importing custom policies

---

## Phase 13: Access Reviews
> 3 related entries

### Access Reviews: Legacy beta Access Reviews APIs (Microsoft Graph beta) stop working. Calls to beta Access Reviews API endpoints return errors after...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft retired legacy beta Access Reviews APIs starting July 1, 2025 (tenants not actively using them) through September 1, 2025 (active tenants).

**Solution**: Migrate to v1.0 Graph APIs for Access Reviews: https://learn.microsoft.com/en-us/graph/api/resources/accessreviewsv2-overview?view=graph-rest-1.0. Update all code using beta Access Reviews endpoints to the v1.0 equivalents.

---

### Access Reviews historical data older than 12 months inaccessible via Graph API, Entra portal, or review history reports after August 1, 2025.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: New data retention policy limits AR data to 12 months. Archived data (1-2 years) available via support ticket only.

**Solution**: Export historical data before Aug 15, 2025 using custom report script (learn.microsoft.com). Use ADX for storage. No extension requests granted. MC1101895 (WW/GCC), MC1102763 (Gallatin).

---

### Catalog Access Review for custom data provided resource is stuck in Applying state and never transitions to Applied
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Not all review decisions have been PATCH-ed with applyResult via the Graph API. The review only transitions to Applied state once ALL custom data provided decisions have been marked with an apply result

**Solution**: For each denied decision, call PATCH /identityGovernance/accessReviews/definitions/{reviewId}/instances/{instanceId}/decisions/{decisionId} with body {applyResult: Success/Failure/PartialSuccess/NotSupported, applyDescription: description}. The review has a 30-day window during Applying state to complete all PATCH operations

---

## Phase 14: Lifecycle Workflows
> 3 related entries

### Lifecycle Workflow mover trigger with attribute change does not process users even though the attribute value appears to match the scope rule
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Attribute scoping rules in Lifecycle Workflows are case sensitive. E.g. scope rule (department eq Secret) will NOT match department=secret

**Solution**: Ensure exact case match between scope rule and actual attribute value. Check via Graph API: GET /users/{id}?$select=department

---

### Cannot create Lifecycle Workflow without a template in Azure portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure portal requires workflows to be based on a template; creating workflows from scratch without a template is only supported via Microsoft Graph API

**Solution**: Use Microsoft Graph API to create a workflow without using a template. Portal-created workflows must be based on an existing template.

---

### Changes to Lifecycle Workflow tasks or execution conditions not taking effect after update
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Modifying tasks or execution conditions requires creating a new version of the workflow. Direct in-place updates to existing version tasks/conditions are not supported.

**Solution**: In Azure portal, changes to tasks/execution conditions auto-create a new version. In Microsoft Graph, call the createNewVersion method explicitly. Only basic info (display name, description) can be updated without versioning.

---

## Phase 15: Bulk Operations
> 3 related entries

### Bulk operations in the Entra portal timeout and fail on very large tenants (e.g., Microsoft Corporate tenant).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known scaling limitation of the bulk operations service. New service is being developed. Related CRI: 503517148.

**Solution**: Refine filters to limit data returned, or use PowerShell with direct MS Graph API calls. See: https://learn.microsoft.com/en-us/entra/fundamentals/bulk-operations-service-limitations

---

### Bulk Ops export produces empty CSV when exporting members of a group with IsMembershipHidden (HiddenMembership) set to true, despite Entra Portal s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 1st-party Bulk Ops application is missing the Member.Read.Hidden permission, so ListGroupHiddenMembership task is denied. Bug: 3487970.

**Solution**: Use Graph API or PowerShell to export members of hidden-membership groups. See: https://learn.microsoft.com/en-us/entra/fundamentals/bulk-operations-service-limitations#bulk-download-members-of-a-group

---

### Bulk Ops fails in GDAP/partner scenarios. Partner opens Partner Center, gets redirected to customer tenant, attempts bulk operation and gets Error ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: GDAP scenarios are not currently supported by new Bulk Ops (as of Feb 2026). Work item: 3530684.

**Solution**: No workaround for GDAP bulk ops. Partners should use Graph API or PowerShell directly in the customer tenant context.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to remove specific proxyAddress from Azure AD user who has no Exchange O... | Without Exchange license, Exchange Admin Center cannot ma... | Use MS Graph API beta: PATCH users/{userId} with {proxyAd... | 🟢 9.0 | OneNote |
| 2 | Soft-deleted device returns HTTP 404 Not Found when queried via Graph API or ... | Soft-deleted objects are moved to a separate deleted cont... | Check deleted items via Graph API: GET https://graph.micr... | 🟢 8.5 | ADO Wiki |
| 3 | Device Registration Policy API calls fail after Sept 25 2023 rollout - PUT re... | Microsoft introduced a breaking change to the Device Regi... | 1) Detect format via GET request before issuing PUT - che... | 🟢 8.5 | ADO Wiki |
| 4 | Device Registration Policy API calls fail after September 2023 rollout - mult... | Breaking change to deviceRegistrationPolicy beta API: mul... | Option 1: Issue GET request first to detect format (check... | 🟢 8.5 | ADO Wiki |
| 5 | Admin wants to block BitLocker self-service recovery for end users but settin... | Feature design: 'Restrict non-admin users from recovering... | Configure via: 1) Azure AD Portal > Device Settings > tog... | 🟢 8.5 | ADO Wiki |
| 6 | Application calls to Azure AD Graph API (graph.windows.net) fail with errors ... | Azure AD Graph API service (graph.windows.net) deprecated... | Migrate application to Microsoft Graph API. For temporary... | 🟢 8.5 | ADO Wiki |
| 7 | Get-MgUser with filter on signInActivity/lastSignInDateTime returns 400 Bad R... | Per PG confirmation: when querying users and filtering la... | Use Invoke-MgGraphRequest with manual pagination instead ... | 🟢 8.5 | ADO Wiki |
| 8 | Restoring a soft-deleted application fails with error: A conflicting AppIdent... | Another active application in the tenant has a matching v... | Remove or change the conflicting AppIdentifierUri from th... | 🟢 8.5 | ADO Wiki |
| 9 | Get-MgUser with signInActivity/lastSignInDateTime filter returns 400: Number ... | PG confirmed: reporting API may incorrectly paginate and ... | Use Invoke-MgGraphRequest with manual pagination: /v1.0/u... | 🟢 8.5 | ADO Wiki |
| 10 | Restoring a soft-deleted application fails with error: A conflicting AppIdent... | Another active application in the tenant has a matching v... | Remove or change the conflicting AppIdentifierUri from th... | 🟢 8.5 | ADO Wiki |
| 11 | Application cannot access protected resources or obtain new access tokens. En... | Application has been deactivated by setting 'isDisabled' ... | To re-enable: use Microsoft Graph API PATCH to set isDisa... | 🟢 8.5 | ADO Wiki |
| 12 | 403 error 'The size of the object has exceeded its limit. Please reduce the n... | Maximum of 20 federated identity credentials allowed per ... | Either delete an existing federated identity credential f... | 🟢 8.5 | ADO Wiki |
| 13 | Error adding/verifying subdomain in Entra portal when parent domain is federa... | Portal bug - subdomains inherit parent domain's authentic... | Use PowerShell + Graph API instead of portal: 1) Connect-... | 🟢 8.5 | ADO Wiki |
| 14 | Creating a governance policy template fails with HTTP 409: Governance Policy ... | A governance policy template with the same display name a... | Use a unique display name. Check existing templates via G... | 🟢 8.5 | ADO Wiki |
| 15 | Creating a governance policy template fails with HTTP 400: Group is not role ... | The security group specified in the policy template is no... | Use a role-assignable security group: Entra admin center ... | 🟢 8.5 | ADO Wiki |
| 16 | Enterprise Apps filter "Assignment Required = Not required" in Azure Portal s... | Portal requires ExplicitAccessGrantRequired to be explici... | Use MS Graph API: GET /servicePrincipals?$filter=appRoleA... | 🟢 8.5 | ADO Wiki |
| 17 | App management policy for password restriction not working; passwordAdditionE... | Bug in Portal UI creating CSA with wrong data type (fixed... | Create a new CSA set and attribute with String type and i... | 🟢 8.5 | ADO Wiki |
| 18 | Unable to assign groups to Enterprise Application - error "Groups are not ava... | Bug in license check for group assignment in Enterprise A... | Use Microsoft Graph API as workaround for group assignment. | 🟢 8.5 | ADO Wiki |
| 19 | Error verifying subdomain with federated parent: One or more properties conta... | Portal bug - subdomains inherit parent authenticationType... | PowerShell+Graph: 1) New-EntraDomain -Name child.mydomain... | 🟢 8.5 | ADO Wiki |
| 20 | Enterprise Apps Assignment Required filter shows fewer apps in Portal than Ex... | Portal requires ExplicitAccessGrantRequired explicitly fa... | Use Graph API: GET /servicePrincipals?$filter=appRoleAssi... | 🟢 8.5 | ADO Wiki |
| 21 | App management policy for password restriction not working; CSA created with ... | Portal UI bug creating CSA with wrong data type (fixed Oc... | Create new CSA set with String type via Graph API. | 🟢 8.5 | ADO Wiki |
| 22 | Unable to assign groups to Enterprise App despite P1/P2 license | Bug in license check (Bug 3333754). No ETA. | Use Microsoft Graph API for group assignment. | 🟢 8.5 | ADO Wiki |
| 23 | App Management Policy portal error: The restriction have been modified outsid... | Policy was configured via Graph API or PowerShell, causin... | Use Graph Explorer to manually align settings across all ... | 🟢 8.5 | ADO Wiki |
| 24 | Graph API $select parameter returns no data on /groups navigation property en... | For navigation properties typed as directoryObject, prope... | Use exact CSDL-defined casing for $select on navigation p... | 🟢 8.5 | ADO Wiki |
| 25 | HTTP 403 Access Denied when adding guest user to M365 group via Graph API. MS... | AllowToAddGuests group setting is set to false either at ... | 1) Check tenant-level directory settings: GET group setti... | 🟢 8.5 | ADO Wiki |
| 26 | 422 MissingPrefixSuffix error when creating M365 group from My Groups Portal ... | directoryObject/validateProperties API strips / character... | Workaround: Create M365 groups via Outlook Desktop Applic... | 🟢 8.5 | ADO Wiki |
| 27 | Group overview page in Azure portal shows incorrect member count for extremel... | Backend service limitation: Mezzo service times out when ... | Use PowerShell to enumerate and count members: Connect-Mg... | 🟢 8.5 | ADO Wiki |
| 28 | Directory_ExpiredPageToken error when using skipToken from Graph /groups?$fil... | Known bug in Graph/directory backend. Tracked at Bug 1728... | No workaround currently available. Bug 1728776 is trackin... | 🟢 8.5 | ADO Wiki |
| 29 | Non-admin group owner gets HTTP 403 when calling Graph /groups/{id}/members i... | Group owner has permission to read direct members but lac... | Grant owner additional directory read permissions (e.g. D... | 🟢 8.5 | ADO Wiki |
| 30 | Internal server error (500) when PATCH-ing group settings DefaultClassificati... | ValidateAndTrimDefaultClassification function validates t... | When setting DefaultClassification, ensure the value exis... | 🟢 8.5 | ADO Wiki |
