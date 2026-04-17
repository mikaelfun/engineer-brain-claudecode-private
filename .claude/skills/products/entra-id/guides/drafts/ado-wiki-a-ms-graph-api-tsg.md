---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph API TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Supported%20Technologies/Microsoft%20Graph%20API/Microsoft%20Graph%20API%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Authentication
- cw.AAD-Dev-Boundaries
- cw.AAD-Dev
- cw.AAD-Dev-TSG
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Dev-Boundaries](/Tags/AAD%2DDev%2DBoundaries) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Dev-TSG](/Tags/AAD%2DDev%2DTSG)                 
 


<style type="text/css">
<!--
 .tab { margin-left: 40px; }
-->
<!-- Style used by the note syntax below to indent from the left. -->
</style>

:::template /.templates/Shared/MBIInfo.md
:::

[[_TOC_]]

# Compliance note
This wiki contains test/lab data only.

Microsoft Graph API TSG
#Introduction
When troubleshooting Microsoft Graph errors, it is a good idea to get the HTTP response from Microsoft Graph if possible. All Microsoft Graph error responses would look something like this
```
{
    "error": {
        "code": "InvalidAuthenticationToken",
        "message": "Access token has expired or is not yet valid.",
        "innerError": {
            "date": "2021-04-30T22:39:43",
            "request-id": "8743e75c-3653-4a33-a2a2-a39d818fdd50",
            "client-request-id": "8743e75c-3653-4a33-a2a2-a39d818fdd50"
        }
    }
}
```

It will generally include a error details such as a **Code**, **Message**, and **innerError** which further includes **date**, **request-id**, and **client-request-id**

You can use the **date** and **request-id** to look up Microsoft Graph logs.

<hr/>
<hr/>

#Troubleshooting errors

##400
###Code: BadRequest

####Message: Resource not found for the segment 'xxxxx'.

####Message: Invalid filter clause

####Message: A value without a type name was found and no expected type is available. When the model is specified, each value in the payload must have a type which can be either specified in the payload, explicitly by the caller or implicitly inferred from the parent value.

Invalid property name used for example notice the space at the end of 'passwordProfile '...
```
{
    "passwordProfile ":{
        "forceChangePasswordNextSignIn": false,
        "forceChangePasswordNextSignInWithMfa": false,
        "password": ""
    }
}
```

###Code: Request_UnsupportedQuery
Message: Unsupported Query.

###No error details
Make sure there is a content-type header sent in the request...
```
"Content-Type":"application/json"
```

<hr/>

##401
Code: InvalidAuthenticationToken 

**Message: Access token has expired or is not yet valid**
Token has expired. Ensure a unexpired token is passed to Microsoft Graph

**Message: Access token is empty.**
No access token is sent to Microsoft Graph. Look for the Authorization header in the request and make sure there is a access token.

Header should look something like this...
Authorization: Bearer eyJxxxx...

**Message: CompactToken parsing failed with error code: 80049217**
There is a Authorization header but there is a problem with the way the access token is sent. Check the Authorization header in the request.

Header should look something like this...
Authorization: Bearer eyJxxxx...

**Message: Access token validation failure. Invalid audience.**
Check the aud claim of the access token. It must be one of Microsoft Graphs supported aud claim.
  * https://canary.graph.microsoft.com/
  * https://graph.microsoft.us/
  * https://dod-graph.microsoft.us/
  * https://dod-graph.microsoft.us
  * https://graph.microsoft.com/
  * https://graph.microsoft.us
  * https://graph.microsoft.com
  * 00000003-0000-0000-c000-000000000000

<hr/>

##403
Each workload may throw its various message for request denied to the resource. An error might look something like this

**Code: Authorization_RequestDenied**
**Message: Insufficient privileges to complete the operation.**
First understand if this is an app-only or delegated access token.
https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens#user-and-application-tokens

Then understand what the API endpoint supports. For example take a look at the permissions table for listing users
https://docs.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http#permissions

Then review the permissions in the access token. You can decode an access token @ https://jwt.ms
	For delegated access tokens, the permissions will be listed in the scp claim.
	For app-only access tokens, the permissions will be listed in the roles claim.

If the access token does have the required permissions, then the principal itself may not have access to the resource on the specific workload. The workload will need to support their permission requirements.

For more guidance on troubleshooting **"Insufficient privileges to complete the operation"**
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/926183/Microsoft-Graph-Insufficient-privileges

To verify that the permissions have been consented to, you can review the permissions assigned to the service principal via the Enterprise Apps blade.  
	1. Sign in to the Azure portal @ https://portal.azure.com
	2. Go to Azure Active Directory
	3. Go to Enterprise applications
	4. Look up the application in concern
	5. Under Security, go to Permissions
	6. Review the list of permissions

Keep the following in mind when reviewing permissions  
		 Keep in mind, the Type column informs you on the type of permission, this will be either Application or Delegated
		 Application permissions are used on when the service principal is used to authenticate
Delegated permissions are used when a user signs in with the application  

<hr/>

##404
**Code: Request_ResourceNotFound**

* Message: Resource 'c9d01335-a383-4e21-a023-a1cd734bc0b5' does not exist or one of its queried reference-property objects are not present.
* Message: Resource 'xxxxx' does not exist or one of its queried reference-property objects are not present.

**Cause 1: Resource does not exist**  
The most common cause is the application is in fact sending an invalid resource request. Verify that the URL is correct and the resource actually exists.

**Cause 2: Latency**  
If the resource does in fact exist, wait a few minutes and this should self resolve. The behavior described is expected. Unfortunately there is no SLA for latency due to the complexity of AAD infrastructure. It can range from a couple seconds up to 15 minutes. It is recommended to implement the following  

Please see [404 error when managing objects using Microsoft Graph](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/404-not-found-error-manage-objects-microsoft-graph)

**Retry logic **  
Backoff logic then retry with a number of attempts. For example
* 1st attempt failed: wait 15 seconds
* 2nd attempt failed: wait 30 seconds
* 3rd attempt failed: wait 1 minute
* 4th attempt failed: wait 2 minutes
* 5th attempt failed: wait 4 minutes

Realistically you can probably just wait 1 minute per failed attempt. Keep doing this up to 15 minutes. If it takes longer than 15 minutes, then we can engage the product team to investigate further.


For more info see
https://docs.microsoft.com/en-us/graph/best-practices-concept#handling-expected-errors

Not found	404	In certain cases, a requested resource might not be found. For example a resource might not exist, because it has not yet been provisioned (like a user's photo) or because it has been deleted. Some deleted resources might be fully restored within 30 days of deletion - such as user, group and application resources, so your application should also take this into account.


For more info about Azure AD Architecture
https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-architecture


**Cause 3: can also be caused due to invalid content-length.**

This can happen when then header **Transfer-Encoding** is set to **chunked**. 
We do not supported chucked transfer encoding.

Here is a example **Go** snippet to manually set the Content-Length header
~~~
req, err := http.NewRequest(method, urlPath, ioutil.NopCloser(strings.NewReader(requestBody.Encode())))
req.ContentLength = int64(len(encodedRequestBody))
~~~

<hr/>

## 409 

### Code: Directory_ConcurrencyViolation
Message: Error due to concurrent requests being made to the tenant. Please wait briefly and retry

Most likely the same object was recently requested to be updated and is locked until update is complete. As the error states, wait and try again. Review the MS Graph logs to confirm the same multiple requests are being sent.

Sometimes this may not always be possible, however if possible, make sure all required updates are in the same request.

<hr/>

##415
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/419622/ms-graph-415-unsupported-media-type

<hr/>

##429
**Code: UnknownError**
**Message: This request is throttled. Please try again after the value specified in the Retry-After header**

It is recommended to implement throttling best practices outlined here
https://docs.microsoft.com/en-us/graph/throttling

**Entra ID Reporting API (Microsoft.AAD.Reporting)**  
For Azure AD Reporting API, check out
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/414305/aad-reporting-api-tsg?anchor=troubleshooting-429-errors

Do not send requests to engineering team to increase throttling for this workload. Requests will be rejected. No Exceptions including Strategic customers.

**More Information** 
For more information about other known throttling limits with Entra ID workloads...<br>
[Microsoft Graph Known Issues: 429 throttling](https://supportability.visualstudio.com/AzureAD/_git/AzureAD?path=/AzureAD/Developer/Supported-Technologies/Microsoft-Graph-API/Microsoft-Graph-Known-Issues.md&version=GBmaster&_a=preview&anchor=429-throttling...)

<hr/>

##5xx
Code: InternalServerError

In most cases, its safe to open an IcM for 5xx errors. However check if your scenario is below...

###Message: The MIME type 'text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2' requires a '/' character between type and subtype, such as 'text/plain'.

Ensure the Accept header is set correctly. For example...
Accept: text/html, image/gif, image/jpeg, */*; q=0.2, */*; q=0.2

For more information about usage of the "Accept" header, see...
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept

###503

This can be considered a transient issue. 
* If a 503 occurs sometimes, however, works in a re-try, this is considered transient.
* 503 can also occur even if the PATCH/POST/DELETE request is actually successful 
  * CX should verify if the request was successful by performing a GET request and checking if the values are updated.

<i>The reality is also that in a large-scale distributed system (even small scale tbh) you can't really guarantee anything.  For instance - once data is written to the storage - ideally you'd like to have it guaranteed that the request will always succeed. But the reality is after you finish writing - you still have to do some minimum processing and send the response back to the caller. Which means there will always be a risk that some failure can still happen in post storage write processing. If something fails after storage write - then what would happen is a potential risk of any sort of error code being sent to the caller.

There's effectively 0 way you could guarantee that there will never be failures after a write call.  Which means effectively - no matter what the status code - the client needs to be resilient to failures in general and accept that they may attempt to re-write something that is already written.

Then with a large scale distributed single master system - writes can be interrupted at any time as well due to parallel writes.</i>

See [IcM 671049069](https://portal.microsofticm.com/imp/v5/incidents/details/671049069/summary)

However if the 503 is consistent (occurring greater than 0.1% of the requests), please open a new IcM

###504: Gateway Timeout server error response code

Check if your scenario matches the following...
* [Calling AuditLogs Reporting API](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/812934/Known-Issues?anchor=**issue-2**%3A-gateway-timeout-(http-504)-error-when-calling-get-azureadauditsigninlogs-or-loading-reporting-logs-in-the-portal-or-when-using-graph-to-call-the-reporting-api)

####If using $Batch calls...

Request calls using $Batch are expected to complete within 30 seconds. If the request takes longer than 30s, MS Graph is going to timeout the request and return a 504 HTTP status code error.

The request calls themselves even though MS Graph is timing out the operation might still be completing the request.

You will need to determine if the individual request is expected to take longer than 30s or less than 30s. If it is expected to take longer then 30s, then do not use $batch for these requests.

Another suggestion would be to individually retry the request.

For more information on using [Microsoft Graph Json Batching](https://learn.microsoft.com/en-us/graph/json-batching?tabs=http)

<hr/>

##Other errors
In general, always verify the permissions on the access token. Sometimes we see a 500 or 400 error and the root cause ends up being a missing permission in the access token.

<hr/>

##Implement backoff Retry logic...

Implement this for...
* 5xx
* 404 when performing a PATCH request immediately after creating the resource (need to wait for replication)

1st retry attempt: wait 1 second<br>
2nd retry attempt: wait 2 second<br>
3rd retry attempt: wait 4 second<br>
4th retry attempt: wait 8 second<br>
5th retry attempt: wait 16 second<br>

<hr/>

##Missing data scenarios
There are some scenarios where MS Graph service returns success status code.  However in the response, the values for certain attributes or fields shows up as null instead of having some values.

**Custom Security Attributes**
***Problem***:  Customer makes the following query to get the user's CustomSecurityAttributes:
GET https://graph.microsoft.com/v1.0/users/<User OID or UPN>?$select=id,displayName,customSecurityAttributes.  Other fields show up fine but customSecurityAttributes shows up as null

***Resolution***:
Make sure they have the following documented permission:
https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http#permissions-for-specific-scenarios

_To read the customSecurityAttributes property_:
* In delegated scenarios, the signed-in user must be assigned the Attribute Assignment Administrator role and the app granted the CustomSecAttributeAssignment.Read.All permission.
* In app-only scenarios with Microsoft Graph permissions, the app must be granted the CustomSecAttributeAssignment.Read.All permission.

#### Some properties are missing or returned as null

When querrying for resources, some properties maybe null. Please review the Microsoft Graph documentation for the API call your making to check the requirements for a specific property to be returned.

For example, lets say you are calling 'GET /users/user-id' and the **postalCode** is not getting returned. Take a look at [user resource type](https://learn.microsoft.com/en-us/graph/api/resources/user?view=graph-rest-1.0)

When you scroll down to review **postalCode** you will see that it says 'Returned only on $select.'

For more information on using **$select** please see [select parameter](https://learn.microsoft.com/en-us/graph/query-parameters?view=graph-rest-1.0&tabs=http#select-parameter)

**Group and Directory Role**
***Problem***:  Customer makes the following query to get the list of groups and directory roles that the user is a direct member of:
GET https://graph.microsoft.com/v1.0/me/memberOf
GET https://graph.microsoft.com/v1.0/users/{id | userPrincipalName}/memberOf
Only the id field has value.  Other fields show up as null

***Resolution***:
Make sure they have the **Directory.Read.All** permission:

<hr/>
<hr/>

#Other Microsoft Graph behaviors

### Microsoft Graph permissions for Microsoft Accounts
There is a small subset of MS Graph API permissions that Microsoft Accounts can consent to. Here is a list of know permissions available to Microsoft Accounts.
* Application.Read.All
* Application.ReadWrite.All
* Calendars.Read
* Calendars.ReadWrite
* ccs.ReadWrite
* Contacts.Read
* Contacts.ReadWrite
* Device.Command
* Device.Read
* Device.Read.All
* Family.Read
* Files.Read
* Files.Read.All
* Files.Read.Selected
* Files.ReadWrite
* Files.ReadWrite.All
* Files.ReadWrite.AppFolder
* Group.Read.All
* Group.ReadWrite.All
* Mail.Read
* Mail.ReadWrite
* Mail.Send
* MailboxSettings.Read
* MailboxSettings.ReadWrite
* Notes.Create
* Notes.ReadWrite
* Notes.ReadWrite.All
* People.Read
* Tasks.Read
* Tasks.ReadWrite
* User.Read
* User.ReadWrite
* UserActivity.ReadWrite.CreatedByApp
* UserTimelineActivity.Write.CreatedByApp

Check here for a updated list...<br>
https://msazure.visualstudio.com/One/_git/AAD-FirstPartyApps?path=/Internal/Config/MsaPermissions/MsaPermissions.txt

### How to manage specific Groups

1. Do not assign any API permissions.
1. Add the principal object as an owner of the group.

### How to manage specific Applications

1. Do not assign any API permissions.
1. Add the principal object as an owner of the application.

### How to manage other specific objects

In most cases this is not possible. We do not have granular resource permissions.

<hr/>
<hr/>

#Microsoft Graph Logs

##Data Retention
Microsoft Graph Service only retains data for the last 3 weeks or 21 days

##Using Azure Support Center

##Using Kusto
To request for permissions, request to join the following IDWeb group: graphagspartners
The Kusto endpoint is https://msgraphkus.kusto.windows.net:443

For more information about Kusto
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/320763/Kusto-and-Jarvis-Log-Analysis

Here is an example Kusto query
~~~
let start = datetime(2021-04-29T20:30:29);
let end = datetime(2021-04-29T20:32:29);
cluster("msgraphkus").database("msgraphdb").GlobalAggregatorServiceLogEvent
| where env_time > start and env_time < end
//| where * contains "2353fc2a-3f0a-4b27-ab3e-df46d0644537" // Search Term
| where correlationId == "b9d2f12e-ff4d-4d76-9778-f97758314381"
//| where message contains "One or more of your reply urls is not valid"
//| where appId == "xxxxxxxx-ebf2-47d3-a4eb-ba2a9ee86a95"
| where tenantId == "xxxxxxxx-e0a0-4eeb-87cc-3a526112fd0d"
//| where oidClaim == "xxxxxxxx-0df7-4ae5-a5c9-c630466a6ca7"
//| where requestMethod == "PATCH"
| where incomingUri contains "signIns"
//| where targetWorkloadId == "Microsoft.SharePoint"
// HTTP Status Code
//| where responseStatusCode != "200" and responseStatusCode != "0" and responseStatusCode != "201" and responseStatusCode != "204"
//| where tagId == 30746268 // response & token info
//| where tagId == "306D6A6B" // Error tagId (also shows workload)
//| where tagId == "30676F66"
// filter on high Duration (MS)
// | where (totalAgsDuration/10000) > 1000
//| where env_cloud_location != "West US 2" // Datacenter location
| project env_time, env_seqNum, correlationId, tagId, appId, tenantId, oidClaim, targetWorkloadId, outboundRequestId, totalAgsDuration, totalOutBoundDuration, operations, requestMethod, responseStatusCode, accountType, apiVersion, message, tokenClaims, targetUri, incomingUri, resultSignature, resultType,resultDescription,responseHeaders, clientRequestHeaders, additionalFields, env_cloud_location, env_cloud_environment
| sort by env_time, env_seqNum
//| summarize count() by incomingUri

### Review Content-Length

Review the `responseHeaders` field and look for `Content-Length`. This can be useful if CX is reporting intermittent different responses

Minimum Content-Length should be around 120. If the number is greater than this, then we are in fact returning data. I would suggest you reproduce the CX exact scenario and confirm your Content-Length
~~~

<hr/>

## Reporting issues with Microsoft Graph PowerShell or Graph Explorer

For Microsoft Graph PowerShell, please have the customer open a GitHub issue here...<br>
https://github.com/microsoftgraph/msgraph-sdk-powershell/issues

For Microsoft Graph Explorer, please have the customer open a GitHub issue here...<br>
https://github.com/aws/graph-explorer/issues

<hr/>

## IcM: Escalate to Product Team/Engineering (Entra ID Workloads) ##

Before escalating to the product team, please review the IcM training and guidelines...
* https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589898/ICM
 
Collect the following information and provide these details in the IcM request...
* **Client Request ID and Date/time off issue**
* Workload ID throwing the error.
You can use the Microsoft Graph Support boundary doc to help you determine the workload...
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/473410/Microsoft-Graph-Support-Boundaries
* Resource Tenant ID
* Client ID of the application
* Support case number
* The full URL including query parameters of the Microsoft Graph API call
* If applicable, the Microsoft Graph request content
* Microsoft Graph reponse Correlation ID (client-request-id) and the Date and Time
* The full Microsoft Graph response content. This will include the full error details. 
  * If this  is a successful response. 
Only provide what the problem is of the response. What is the expected response? **Do not put PII here.**
* Can the issue repro on-demand?
* Can the issue be reproduced by support?
* Repro steps
* Error message details from Microsoft Graph (i.e. the full **response** from Microsoft Graph)
* What is the expected response
* Can this be reproduced on-demand? What is the frequency?
* Did this ever work as expected for the customer?
* If so, when did the customer notice a change in behavior?
* Is there a known workaround found?
* If possible, Fiddler capture of issue (working capture if applicable)

### Use Azure Support Center (ASC)

1. Go to ASC
2. Click on **Escalate Case** on top right corner
3. Go to **All** tab
4. Choose one of the following templates...
  * If this is for the Users API: Use **User management via Graph** (id: q2p12g)
  * If this is for the Groups API: Use **Graph management via Graph** (id: a211k3)
  * For all other Graph issues, use **General Cloud Identity Template** (id: s2DJ2k)

Once the IcM is opened, assign the IcM to your TA or designated SME

TA/SME will review the IcM and update the **Service** and **Team**

### Use Microsoft Graph Request Debugging Tool (Deprecated)
Please do not use this process anymore. It does not open IcMs as Restricted IcMs which is now required when support opens IcMs. Please use ASC process above.

You must already know the Client-Request-Id and Timestamp.

1. Navigate to the Microsoft Graph Request Debugging Tool: https://support.iam.ad.azure.com/livesite/msgraph
If you don't have permission, then request permission.

2. Select **"Microsoft Graph Request Debugging Tool"**
3. Enter the Client Request ID for **"Graph Request Id or Correlation Id"**
4. Select the Date and time for **"Timestamp"*
5. Click **Next**
6. Click **"Create IcM"** button 
Create IcM button is only available if there is an error.
7. You should get a link to the IcM. If this doesn't happen, The IcM does get created. You may have to manually look for it.
Here is a IcM Filter
Global fields/Create Time > on or after > @today - 1
Global fields/Created Vy > == > gautosvc
Global fields/AlertSource Name > == > MicrosoftGraphLogInsights

Once the IcM is opened, add additional details from the information collected earlier.

> **REQUIRED**
> Additional fields to be updated...
> * Go to the **Impact Assessment** tab then...
>   * under **Customer impact and support requests/Support request details**:  Add the case number 
>   * under **Incident Classification/Incident Type** to **Customer Reported**
>   * under **Incident Classification/Keywords**:  Add **CIDCRI**, **CIDDev**, CIDRegion (i.e. CIDNOAM || CIDAPAC || CIDEMEA) 

### **TA/SME Instructions**

Use the table below to select the best **Service** and **Team**

Based on the Workload Id, open the IcM against the following Service and Team...
Workload | Path/Scenario | IcM Service | IcM Team Name | Logs
-|-|-|-|-
Microsoft.AADInviteMg | | Invitation Manager | Triage | [B2B collaboration TSG: Searching B2B Service Logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/749168/B2B-collaboration-TSG-Searching-B2B-Service-Logs)
Microsoft.AAD.Reporting | /reports<br/>/auditLogs<br>signInActivity | IDX | Reporting and Audit Insights | [How to Check for Logs using Kusto and Jarvis](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/430656/How-to-Check-for-Logs-using-Kusto-and-Jarvis)
Microsoft.AppManagement | | Enterprise App Management | Enterprise App Management
Microsoft.AppProxy | | AAD Application Proxy | On Call Team
Microsoft.AppPublisher | | AAD First Party Apps | AAD Application Model
Microsoft.AuthenticationMethodsPolicy | | ISP Credentials Management Service | Credentials Management
Microsoft.BitLocker | | ADRS | ADRS
Microsoft.CPIM | | CPIM | Triage
Microsoft.DirectoryServices | /applications<br>/servicePrincipals | AAD First Party Apps | AAD Application Model<br>Applications and ServicePrincipals API 
Microsoft.DirectoryServices | /users | IAM Services | Users Graph API
Microsoft.DirectoryServices | /groups | IAM Services | Groups Graph API | For more troubleshooting see...<br>[Queries for Groups Graph API calls](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/58937/Queries-to-run-to-find-out-information-about-an-AAD-Groups-Graph-API-calls-AAD-Groups-)<br>[Investigating 'Permission denied'](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/58461/Investigating-'Permission-denied'-Groups-Graph-API-incidents-AAD-Groups-)
Microsoft.DirectoryServices | /organization | IAM Services | Organization Graph API
Microsoft.DirectoryServices | /policies/crossTenantAccessPolicy | IAM Services | Cross-Tenant Experience
Microsoft.DirectoryServices | /domains | UMTE | Domain API 
Microsoft.DirectoryServices | /delta<br>or Delta query issues | Microsoft Graph Service | Delta query: Delta Query
Microsoft.DirectoryServices | User Licensing issues | UMTE | Customer Escalation - Tenant Provisioning
Microsoft.DirectoryServices | Everything else | AAD Distributed Directory Services | Programmability Infra
Microsoft.EnterpriseRbac | | Policy Administration Service | Triage
Microsoft.ESTS* | | ESTS | eSTS
Microsoft.Graph.Extensibility | | Microsoft Graph Service | Microsoft Graph Aggregator
Microsoft.Graph.AggregatorService | | Microsoft Graph Service | Microsoft Graph Aggregator
Microsoft.IC3.DataPlatform | | IC3 Records | IC3 Records Distribution
Microsoft.IdentityGovernance.AccessReviews | | AAD Access Reviews | Access Reviews
Microsoft.IdentityGovernance.Insights | | AAD Identity Governance Insights | Triage
Microsoft.IdentityGovernance.TermsOfUse | | AAD Terms Of Use | Triage
Microsoft.IdentityProtectionServices | Identity Protection issues | AAD Identity Protection | IPC Dev
Microsoft.IdentityProtectionServices | Conditional Access issues | Conditional Access | Triage
Microsoft.IGAELM | | Azure AD Entitlement Lifecycle Management | Triage
Microsoft.Graph.Extensibility | | Microsoft Graph Service | Microsoft Graph Aggregator
Microsoft.MAUXServices | | IAM Services | IcM Team: Entra - Management Admin UX
Microsoft.SecurityDetectionsAndIncidents | /security/alerts | Intelligent Security Graph | SIPS API | Please see [Microsoft Graph Security API TSG](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/391550/Microsoft-Graph-Security-API-TSG) 
Microsoft.SubscriptionServices | | Microsoft Graph Service | Microsoft Graph WebHooks
Microsoft.PICS.Admin | | Decentralized Identity Services | Triage - OCE
Microsoft.PIM* | | Azure Privileged Identity Management | On Call Team
Microsoft.StrongAuthenticationAPI | | ISP Credentials Management Service | Credentials Management

#### Other scenarios

Scenario | IcM Service | IcM Team Name
-|-|-
Issues with Microsoft Graph Service Bicep Extensions | Microsoft Graph Service | Graph ARM Provider
Issues with Webhooks/Change Notifications | Microsoft Graph Service | Microsoft Graph Webhooks
Issues with Delta Queries | Microsoft Graph Service | Delta Query

For Microsoft Graph programmatic SDKs, please see [Create IcM for MSAL and Microsoft Graph SDKs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1841379/Create-IcM-for-MSAL-and-Microsoft-Graph-SDKs)

#### Microsoft Graph Aggregator Service (AGS)

If you believe this is a core Microsoft Graph issue and its not an issue with a target Workload. 

Open an IcM to...<br>
* **IcM Service:** Microsoft Graph Service
* **IcM Team:** Microsoft Graph Aggregator

Examples of issues...
* Issues related to Microsoft Graph IP addresses
* Issues related to SSL certificates used by Microsoft Graph
* Other issues related to network connectivity to Microsoft Graph (i.e. Live Site Incident has been identified)
* Issues when target workload is not listed

### Find Engineering contacts

This has moved.

Please see [Find the engineering group who owns the workload](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/473410/Microsoft-Graph-Support-Boundaries?anchor=find-the-engineering-group-who-owns-the-workload)

<hr/>

##Troubleshoot geneneral latency or performance issue
There are 2 columns in MS Graph logs that can provide a general idea of how long the request takes to process.  The unit in these columns is based on ticks.
> In computing, a tick is a unit of time measurement that represents the smallest time interval recognized by the system clock. One tick typically equals 100 nanoseconds or 0.0000001 seconds1. This means there are 10,000 ticks in a millisecond and 10 million ticks in a second
* totalOutboundDuration - shows how long the request takes after (Aggregator Service) AGS sends the request to the workload until AGS receives the workload response.  Note that this counter also includes networking factor.  It does not mean the workload takes that long to process. It could mean internal networking issue taking a long time to send the request to the backend workload.  One would have to engage the workload team for further analysis.
* totalAgsDuration - shows the total time it takes from the time AGS receives the request from the client to sending the response back to the client

In the table below it shows Microsoft.DirectoryServices taking ~659 milliseconds from AGS perspective

| totalOutBoundDuration | totalAgsDuration | targetWorkloadId |  
|-----------|:-----------:|-----------:|  
| 6592262 | 6623475 | Microsoft.DirectoryServices |  

So 6,623,475 / 10,000 = 662 milliseconds

While using [Data Explorer](https://dataexplorer.azure.com/clusters/msgraphkus/databases/msgraphdb), You can also filter on long latencies...
```
let start = datetime(2024-10-24T19:44:01);
let end = datetime(2024-10-24T19:46:29);
cluster("msgraphkus").database("msgraphdb").GlobalAggregatorServiceLogEvent
| where env_time > start and env_time < end
| where tenantId == "xxx" 
| where appId == "xxx"
// filter on high Duration (milliseconds)
| where (totalAgsDuration/10000) > 20000 // request taking longer than 20 seconds
| project env_time, responseStatusCode, requestMethod, correlationId, tagId, appId, tenantId, oidClaim, targetWorkloadId, outboundRequestId, totalAgsDuration, totalOutBoundDuration, responseSize, accountType, apiVersion, tokenClaims, targetUri, incomingUri,responseHeaders, clientRequestHeaders, env_cloud_name, env_cloud_location, env_cloud_environment, proxyAttemptedTargets, tokenUti  
```

<hr/>

# Feature requests or additional help

Customers can submit features requests here...<br>
https://feedbackportal.microsoft.com/feedback/forum/ebe2edae-97d1-ec11-a7b5-0022481f3c80

When customers need help that is outside of our scope of support or the customer would like to report a bug with an API, the customer can post questions here...<br>
[Microsoft Q & A: Microsoft Graph](https://learn.microsoft.com/en-us/answers/tags/161/ms-graph)  

When customers wants support to submit feature requests, use the following Design Change Request (DCR) process...<br>
* Entra ID workloads: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/412862/AAD-DCR-Community-request
* Microsoft 365 workloads: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1291814/M365-Design-Change-Request

Other workloads may have a different process.

> IcM should be opened for **critical** DCRs. However, no commitments nor expectations towards acceptance or timeframe for response/deployment should be set. This will still be treated as any normal DCR.

You can also submit questions to the [Internal StackOverflow](https://stackoverflow.microsoft.com/) with tag **microsoftgraph**.

