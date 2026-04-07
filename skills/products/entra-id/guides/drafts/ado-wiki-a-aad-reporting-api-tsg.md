---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/AAD Reporting API/aad reporting api tsg"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FAAD%20Reporting%20API%2Faad%20reporting%20api%20tsg"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Dev
- cw.AAD-Workflow
- cw.AAD-Dev-MSGraph
- cw.AAD-Dev-TSG
- cw.AAD-Dev-Boundaries
- cw.AAD-Reports
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Dev-MSGraph](/Tags/AAD%2DDev%2DMSGraph) [AAD-Dev-TSG](/Tags/AAD%2DDev%2DTSG) [AAD-Dev-Boundaries](/Tags/AAD%2DDev%2DBoundaries) [AAD-Reports](/Tags/AAD%2DReports)         
        

:::template /.templates/AAD-Developer/under-construction.md
:::

:::template /.templates/Shared/MBIInfo.md
:::

[[_TOC_]]

# AAD Reporting API Troubleshooting Guide (TSG)

This article applies to the Audit logs (SignIns and DirectoryAudit logs) Reporting API...

i.e. https://graph.microsoft.com/v1.0/auditLogs/...

Risk Detections API does have different API permission requirements and latencies.

For more information about Risk Detection and Identity Protection...

https://docs.microsoft.com/en-us/azure/active-directory/identity-protection/overview-identity-protection

## Support Boundaries

| Scenario | Support Team
| - | -
| How to make API calls and pull audit Log reports | Azure AD Developer
| Getting 4xx or 5xx errors | Azure AD Developer
| Missing entries from the API results (Asumming you see the results in Azure portal) | Azure AD Developer
| Questions/Issues or investigate a "sign-in" entry | Azure AD Authentication
| Questions/Issues or investigate a "directory audit" entry | Azure AD Account Management
<br>

> **NOTE** If the data matches between Azure portal vs API, then the issue is not with the API itself rather with the Reporting service which should be supported by the respective team (**sign-ins: Azure AD Auth**; **directory audits: Azure AD Account Management**)

<hr>

## How-to use

Setting up requirements to use the API...

https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/howto-configure-prerequisites-for-reporting-api#:~:text=The%20Azure%20Active%20Directory%20%28Azure%20AD%29%20reporting%20APIs,access%20to%20the%20reporting%20API%2C%20you%20need%20to%3A

Getting sign-in logs using the API might look something like this...
~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns
~~~
For more information see...

https://docs.microsoft.com/en-us/graph/api/signin-list?view=graph-rest-1.0&tabs=http

<hr>

## Troubleshooting 403 errors

Verify the sub error message from the response. It would looke something like this...

~~~
{
    "error": 
      {
          "code": "Authentication_RequestFromNonPremiumTenantOrB2CTenant", 
          "message": "Neither tenant is B2C or tenant doesn't have premium license", 
          "innerError": 
          {
            "date": "2020-11-05T12:09:59", 
            "request-id": "41cbb5d0-7934-4900-af6b-6430f816d53d",
            "client-request-id": "41cbb5d0-7934-4900-af6b-6430f816d53d"
          }
      }
}
~~~

For example "Neither tenant is B2C or tenant doesn't have premium license" would be the sub error.

### "Neither tenant is B2C or tenant doesn't have premium license"

**Issue: Tenant is B2C**

AAD Reporting API can not be used with B2C tenants.

**Issue: Does not meet license requirement**

First, make sure that your tenant has the Azure AD Premium P1 or P2 subscription.

* Enterprise Mobility Suite (EMS) 3 includes Azure AD Premium P1
* Enterprise Mobility Suite (EMS) 5 includes Azure AD Premium P2

**Issue: Directory.Read.All application permission missing**

For application based access tokens, Ensure the Directory.Read.All permission is added to the API permissions, consented, and is in the "roles" claim of the access token. 

> This issue might occur intermittently if the permission is missing.

For more information, see...

https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/howto-configure-prerequisites-for-reporting-api#grant-permissions


### "User is not in the allowed roles"

For user-based access tokens, make sure the user is a member of one of the required admin roles... (non-admins cannot use the API)

* Security Administrator
* Security Reader
* Global Reader
* Report Reader roles
* Global Administrators

Also check for an updated list of required admin roles...

https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/concept-sign-ins#who-can-access-the-data

### "Calling principal does not have required MSGraph permissions AuditLog.Read.All"

Ensure the AuditLog.Read.All permission is added to the API permissions, consented, and is in the "scp" or "roles" claim of the access token. 

<hr>

## Troubleshooting 429 errors 

Reporting API does have a throttling limit...

https://docs.microsoft.com/en-us/graph/throttling#identity-and-access-audit-logs-service-limits

| Request type | Limit per app per tenant | Limit per app across all tenants
|-|-
|Any | 5 requests per 10 seconds | 122 per 10 seconds

A throttling error might look something like this...

~~~
{
  "error": {
    "code": "UnknownError",
    "message": "Too Many Requests",
    "innerError": {
      "date": "2020-11-18T16:48:45",
      "request-id": "1caf84b4-b017-41c7-b2eb-238d1437965d",
      "client-request-id": "1caf84b4-b017-41c7-b2eb-238d1437965d"
    }
  }
}
~~~

It is also known that the API reporting API throws transient 429 errors. It might look something like this...

~~~
{
    'error': 
    {
        'code': 'UnknownError',
        'message': 'This request is throttled. Please try again after the value (in seconds) specified in the Retry-After header.
        CorrelationId: 8649ffa7-cb27-4e08-b9e8-9133d0898149',
        'innerError': 
        {
            'date': '2020-10-30T22:18:44',
            'request-id': '7bab35d5-1d21-47e4-81ba-13f881f282c7',
            'client-request-id': '7bab35d5-1d21-47e4-81ba-13f881f282c7'
        }
    }
}
~~~

I would generally start with performing a KUSTO query (sample below) to get an idea of how often they are calling the API and make sure they staying below the throttling limit.

Here are some common steps to resolve the issue. Each customer might have different behaviors and may have different solutions...

### **Ensure re-try logic is used**

Take the Response Headers and look for the "Retry-After" header.

```
HTTP/1.1 429
Cache-Control: private
Content-Type: application/json
Retry-After: 10
request-id: 1caf84b4-b017-41c7-b2eb-238d1437965d
client-request-id: 1caf84b4-b017-41c7-b2eb-238d1437965d
x-ms-ags-diagnostic: {"ServerInfo":{"DataCenter":"South Central US","Slice":"SliceC","Ring":"4","ScaleUnit":"002","RoleInstance":"AGSFE_IN_13"}}
Strict-Transport-Security: max-age=31536000
Date: Wed, 18 Nov 2020 16:48:44 GMT
Content-Length: 283
```

Implement re-rty logic based on the header value so for example in the "Retry-After" above you would want to retry the request in 10 seconds. 

If retrying the request does not work or still getting too many 429 errors, try the next item.

### **Set the $top parameter**

So your request should look something like this...
~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns?$top=900  
~~~
Keep dropping the value of the $top parameter by 100 until the 429 errors stop or become much more manageble though the re-try logic.

If you drop it down to 500 and the issue persists, then this solution might not work for you. Try the next item.

### **Use the $filter parameter**

#### **Reduce the time range**
So your request should look something like this...
~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-27 
~~~
If this request fails, then try...
~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-28 
~~~

Or if the following request fails...
~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-20 and createdDateTime le 2020-10-31 
 ~~~
Then try...
~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-21 and createdDateTime le 2020-10-30
 ~~~
> **Hint:** Keep in mind you might also need to review if the issue occurs for hours or minutes.


#### **Simplify the $filter parameter**

Let's say the call looks something like this...
~~~ 
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-27 and ClientAppUsed eq 'IMAP4' or ClientAppUsed eq 'AutoDiscover' or ClientAppUsed eq 'Authenticated SMTP' or ClientAppUsed eq 'Exchange ActiveSync' or ClientAppUsed eq 'Exchange Online PowerShell' or ClientAppUsed eq 'Exchange Web Services' or ClientAppUsed eq 'MAPI Over HTTP' or ClientAppUsed eq 'Offline Address Book' or ClientAppUsed eq 'POP3' or ClientAppUsed eq 'Reporting Web Services' or ClientAppUsed eq 'Other clients' 
~~~

Simplify it like this... (You might have to make additional querries with the other filters)
~~~ 
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-27 and ClientAppUsed eq 'IMAP4'
~~~

### **Run the API query during business off-peak hours**

Try running the API call at different times to see which time will work best for you. Generally, running during business off-peak highers tend to generate improved performance. There is no defined off-peak hours and may be different for each region. I am only going to provide an example of what might be considered off-peak hours:
  * 8pm - 7am

### **Use a combination of solutions above**

Sometimes no one solution works and you may need to combine multiple solutions. You will need to play around using trial and error to find the right combination that works best for you.

<hr>

## Troubleshooting 504 errors

Follow the tips above for troubleshooting 429s. These will also help mitigate 504s.

Please see...  
[Gateway Timeout (HTTP 504) error when calling Microsoft Graph Reporting API](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/812934/Known-Issues?anchor=**issue-2**%3A-gateway-timeout-(http-504)-error-when-calling-get-azureadauditsigninlogs-or-loading-reporting-logs-in-the-portal-or-when-using-graph-to-call-the-reporting-api)

<hr>

## Token not found: token is either invalid or expired

You might be getting an error that looks like this...
~~~
"error": {
    "code": "",
    "message": "Token not found: token is either invalid or expired",
    "innerError": {
      "date": "2020-10-30T12:31:27",
      "request-id": "420b32d9-fc06-4b81-b524-0ccc046896e2",
      "client-request-id": "420b32d9-fc06-4b81-b524-0ccc046896e2"
    }
  }
~~~

Implement re-try logic...
* 1st retry attempt: wait 1 second
* 2nd retry attempt: wait 2 seconds
* 3rd retry attempt: wait 4 seconds
* 4th retry attempt: wait 8 seconds
* 5th retry attempt: wait 16 seconds

Also check when skiptoken was issued and when it is being used. They don't last very long (5 - 10 minutes)

You would have to review customer provided logs and HTTP requests/responses on when the skiptokens are issued. Our logs will not show this detail.

<hr>

## Missing entries

### **Audit log Latency**

Results are getting returned but there are missing entries (or no results and no errors are being returned)

If your querring for the immediate past 15 minutes, there is a chance for sign-in logs to not be propagated yet to appear in the logs. 

So for example right now its '2020-10-31T05:00:00' and your query looks something like this...

~~~
https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge 2020-10-31T04:45:00 and createdDateTime le 2020-10-31T05:00:00 
~~~ 

You might miss some entries. It is possible that latency can occur up to two hours. 

For more information see...

* https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/troubleshoot-missing-audit-data#resolution-1
* https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/reference-reports-latencies
* https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/reference-reports-data-retention

### **Not all sign-ins are captured**

Non-interactive and other sign in event types are only available on the Beta endpoint. When using the v1.0 endpoint you will only see interactive sign-ins.

When using the beta endpoint without any filters like this...
~~~
https://graph.microsoft.com/beta/auditLogs/signIns
~~~

You will only see interactive sign-ins.

In order to see non-interactive signIns, you can filter on signInEventTypes like this...
~~~
https://graph.microsoft.com/beta/auditlogs/signins?$filter=(createdDateTime ge 2021-01-07T18:40Z and createdDateTime le 2021-08-08T00:00Z) and signInEventTypes/any(t:t eq 'nonInteractiveUser')
~~~

For more details you can take a look at the following article...
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/430252/How-To-Retrieve-Non-Interactive-Sign-ins-Using-MS-Graph-API

### Different results between MS Graph API and portal

If filtering on userPrincipalName like this...
~~~
https://graph.microsoft.com/beta/auditlogs/signins?$filter=status/errorCode eq 0 and userPrincipalName eq 'john@contoso.com'"
~~~
The userPrincipalName is case sensitive. The signin logs for this user may have different uppercase and lowercase combinations.

Instead, use startsWith...
~~~
https://graph.microsoft.com/beta/auditlogs/signins?$filter=status/errorCode eq 0 and startsWith(userPrincipalName, 'john@contoso.com')
~~~


<hr>

## More troubleshooting

Take a look at the following article for more errors and solutions...

https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/howto-configure-prerequisites-for-reporting-api#troubleshoot-errors-in-the-reporting-api

Another tip would be to compare what is seen in the Azure AD portal vs results returned in the API. These should match.



### **Using KUSTO**

Permissions needed for KUSTO...
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/320763/Kusto-and-Jarvis-Log-Analysis?anchor=log-analysis-(kusto-%2B-jarvis)

Sample query...
~~~
cluster('idsharedwus').database('AXMPROD').IfxRequestOperationResult
| where env_time > datetime(2020-11-05 20:00:00) and env_time < datetime(2020-11-09 21:00:00)
| where  Actor_TenantId == "e0793d39-####-####-####-############"
//| where Result_HttpStatusCode != 200 // Use this to look up specific HTTP Status code errors
//| where RequestUri contains "directoryAudits" // Look up directoryAudits only
//| where RequestUri contains "signIns" // Look up signIns only
~~~

For more KUSTO tips on troubleshooting Audit Log issues...
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/320782/Missing-customer-facing-audit-events-Troubleshooting 

## Transcluded templates (2)
 
 

- Template: under-construction
([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fAAD-Developer%2funder-construction%0d))
 
 

- Template: MBIInfo
([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fShared%2fMBIInfo%0d))
