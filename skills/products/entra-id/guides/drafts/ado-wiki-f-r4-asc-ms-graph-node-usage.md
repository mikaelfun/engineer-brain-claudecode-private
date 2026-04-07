---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Training/ASC MS Graph Node Usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FTraining%2FASC%20MS%20Graph%20Node%20Usage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Dev
- cw.AAD-Workflow
- cw.AAD-Dev-Training
- cw.AAD-Dev-MSGraph
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Dev-Training](/Tags/AAD%2DDev%2DTraining) [AAD-Dev-MSGraph](/Tags/AAD%2DDev%2DMSGraph)   

:::template /.templates/Shared/MBIInfo.md
:::

[[_TOC_]]

## Introduction  

The purpose of this article is to provide an overview of how to use the Microsoft Graph node in Azure AD Explore to do preliminary kusto log investigation.  

## Accessing the Microsoft Graph Node

1. In ASC, click the **Azure AD Explorer**
1. Click **Microsoft Graph**  
![NodeActivation](.attachments/AAD-Developer/Shared-Assests/ASC-AAD-Explorer-MS-Graph-Node-activationpng.png =600x500)

1. The Microsoft Graph node screen will be displayed without any data in the search windows.  
![InitialScreen](.attachments\AAD-Developer\Shared-Assests\MS-Graph-Node-Base-Screen.png =600x500)
  
For a detailed break out of the MS Graph Node see the image below:  
![link](.attachments\AAD-Developer\Shared-Assests\MS-Graph-Node-Break-OutV2.png =960x800)

### MS Graph Node Break out

1. **Request \(correlation\) id** is the request id or correlation id returned by the failing api call,provided in the response of the request as either part of the body in case of an error, or the response headers upon some form of success.

1. **Start Time** represents the start UTC time for the query.
1. **End Time** represents the ending UTC time for the query.  
The range is _event\_time > **Start Time** and event\_time < **End Time**_
1. **Application ID** for the application generating the error.  Not required if you have the reqeust ID, can be used to narrow to a specific application's results.  Can be very useful with searching for common Status Code\(s\) like 401\( access denied errors\) 429\(throttling errors\).
1. **Workload Id** describes the target work load for a given action.  This value is the same as the TargetWorkloadId returned by the $whatIf query parameter.  
For example:  
Microsoft.DirectoryServices - Azure AAD Graph \(graph.windows.net\)  
Microsoft.Exchange - O365 EXO apis \(outlook.office365.com\)  
Microsoft.FileServices - Sharepoint online resources \(microsoft.sharepoint.com\)

1. **Status Code\(s\)** - common status codes like 200, 401, 429 returned by a given MS Graph Api.  You can specify multiple status code by adding a comma between each code for example:
401,200,500
Wild card are not allowed.

1. **Maximum rows to return** is used to limit search results to a given number of rows.

1. **Return reduced set of columns \(use if searching for request ID\)** checking this box returns a limited number of properties for the query.  Use this box when you are trying to locate information in the MS Graph aggregator logs.  Here is a table of properties returned and their description.

|  Property  |  Description |
|:----------|:------------|
|  env_time |  UTC Time of the given event  |
|  appId  |  Application ID of the application performing the action |
| requestMethod |  HTTP request get, post, delete for example |
| incomingUri |  Incoming Uniform Resource Identifier |
| apiVersion | version of the API being used |
| respondStatusCode | status code of the request, can be any number of values |
| targetWorkloadId | Underlying workload for the API.  Can be used to properly route an issue to the appropriated developer support team.  |
| oidClaim |  value found in the OID claim of a token.  This value represents the object identifier of identity performing the action.  The OID claim value can represent a user or an application.  If the OID points to a user, then the request is being performed in the context of a user \(delegated\). IF the OID points to an application, then the request is being performed in the context of the application.
| correlationId |  unique identifier for the ms graph request |
| internalCorrelationId |  unique identifier that usually matches the correlationId, represents possible cross service identifier |
| outboundRequestId |  unique identifier given to a request to another workload.  This value becomes the correlationId in the target workload.  Can be used to connect the MS Graph request with information in the operations logs of the target workload. |
| accountType |  TBA |
| clientRequestHeaders |  if provided, contains the rquest headers from the client application |
| userAgent |  TBA  |
| env_seqNum | sequence number for the event.  Each event is assigned a sequence number, this can be useful in determining the order in which the events were written to the logs.  These values are recycled overtime |
| targetTenant | unqique identifier of the target tenant |
| tokenClaims |  Breakdown of the JWTToken claims values |
  
9. Add additional columns on a query by unchecking the **Return reduced set of columns \(use if searching for request ID\)** and clicking the ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png).  Once the query is completed and the results are displayed below the query parameter area, add additional columns or remove additional columns to the display by clicking button ![addcolumns](.attachments\AAD-Developer\Shared-Assests\MS-Graph-Node-Add-Rm-Cols-Btn.png) and select the columns you wish to add to the display.  As you check/uncheck the columns in the add/remove columns drop down, they will appear and disappear from the query data area.  
Below is a table of additional properties that are requested when the **Return reduced set of columns \(use if searching for request ID\)**  is unchecked.
  
|  Property|  Description|
|:----------|:------------|
| message|  contains verbose details.  Can contain exception information as well as general property details for the operation.  Extremely useful, but very large.  The property is almost always useful in log analysis, however, its size prevents the property from being considered in the limited property set group|
| responseHeaders|  contains useful information about the header values sent back to the client|
| userAgent|  TBD|
  
### Working with a row of results

Once you have a set of query results there are several features in the MS Graph Node that make it easy to review a row of results.  This section will cover the two major features, expand a row and copy a row to the clipboard for use else where.

#### Expanding a single row of data

After you have successfully ran a query against the MS graph logs by clicking the ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png) button.  Click the Row expansion icon that looks like a greater than symbol \">\" located near the far left of the query results. An example of the the results from cliking the > symbol is illustrated below:  

![ExpandedRow](.attachments\AAD-Developer\Shared-Assests\MSGN-Expanded-Row.png =600x500)
  
#### Copy a row to the clip board
  
Using the clipboard symbol to the right of the query results, the contents a row can be copied to the clipboard \( ![clipboard](.attachments\AAD-Developer\Shared-Assests\MSGN-Clip-Cpy.png) \).  Below is an example the data you can receive when clicking the copy to clipboard icon
<font color=brown>  
env_time:2019-10-02T19:17:34
appId:8e81175b-####-####-####-############
requestMethod:GET
incomingUri:me\/messages\(\'\<key\>\'\)?$expand=Attachments\($select=id,contentType,isInline,name,size\)&$select=id,internetMessageId,subject,body,uniqueBody,bodyPreview,from,ccRecipients,bccRecipients,toRecipients,sender
apiVersion:v1.0
responseStatusCode:200
targetWorkloadId:
oidClaim:0f6f4e1b-95c8-477a-834d-859354380daf
correlationId:5791a6dd-6ec4-4ae5-afa8-d73cc26bf435
internalCorrelationId:5791a6dd-6ec4-4ae5-afa8-d73cc26bf435
outboundRequestId:
accountType:AAD
clientRequestHeaders:\[Cache-Control=no-store, no-cache\]\[SdkVersion=Graph-dotnet-1.2.1\]
userAgent:
env_seqNum:57374018
targetTenantId:72f988bf-####-####-####-############
tokenClaims:aud=\<SNIP\>;nbf=1570043554;exp=1570047454;acct=0;acr=1;aio=;amr=\["pwd"\];app_displayname=Concierge Native App;appid=;appidacr=0;given_name=;ipaddr=13.##.###.194;name=;oid=;onprem_sid=S-1-5-21-21275#####-##########-##########-##########;platf=3;puid=1003############;scp=Mail.ReadWrite Mail.ReadWrite.All Mail.ReadWrite.Shared Mail.Send Mail.Send.All Mail.Send.Shared User.Read;sub=;tid=;unique_name=;upn=;uti=fMxcqXXVvk-EIRyKpF0AAA;ver=1.0;xms_tcdt=1289241547;</font>
  
## Common Scenarios

The MS Graph Aggregator operations logs hold data for about 30 days.  Searching for time frames over 30 days in the past will not produce results.  The following scenarios are examples of how one could setup the MS Graph Node to query the logs.

### Searching for all requests with a given status code in the last few minutes

You have a status code 401, and you know the error occurred in the last 5 minutes.  Enter the status code in the **Status Code\(s\)** and click  ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png)

![Status Code example](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Status-Code-Query.png =600x500)

### Searching for all requests that match more than one status code during a specific time range

You have two status codes, 401 and 200, you want to locate a request that occurred at an approximate time of 2019-09-29T19:03:51.  You want to search for all 401 and 200 status codes across a 10 minute span.

1. Your start time would be   2019-09-29T19:03 - 5 minutes or 2019-09-29T18:58. Enter this time in the **Start Time** edit control.
1. Your end time would be 2019-09-29T19:03 + 5 minutes or 2019-09-29T19:08. Enter this time in the **End Time** edit control.
1. In the **Status Code\(s\)**, enter the status codes of interest separated by a , like: \"401,200\" no need for quotes.
1. click  ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png)  

![Status Code and time frame query](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Time-and-Status-Code-Query.png =600x500)

### Searching for a specific request ID or correlation ID using the default time span

You have a correlation/Request ID value like:
9fd86e5f-4566-4340-adff-8fcc5e9aaac0

with a time stamp or Date response header value of 2019-09-29T19:09:58.

1. In the **Request \(correlation\) id** edit control enter the correlation ID/request ID value:  
9fd86e5f-4566-4340-adff-8fcc5e9aaac0

1. Use the default time span of +- 4 minutes by entering the tiem stamp or Date response header value in the **Start Time** edit control: 2019-09-29T19:09:58
1. click  ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png)  
  
![defaultspan](.attachments\AAD-Developer\Shared-Assests\MS-Graph-Node-ReqeustID-Default-Timespan.png)  

### Searching for a request id or correlation ID in a given time span

You have a correlation/Request ID value like:
9fd86e5f-4566-4340-adff-8fcc5e9aaac0

with an approximate UTC time of 2019-09-29T19:09.  Setup a +-5 minute time span to search for the request Id or correlation Id.

1. In the **Start Time** edit control enter 2019-09-29T19:09 - 5 minutes, 2019-09-29T19:04
1. In the **End Time** edit control enter 2019-09-29T19:09 + 5 minutes, 2019-09-29T19:14
1. In the **Request \(correlation\) id** edit control enter the corrleation ID/request ID value:
9fd86e5f-4566-4340-adff-8fcc5e9aaac0
1. click  ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png) 

![Reqeust ID within default time range](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-ReqeustID-Fixed-Timespan.png =600x500)

### Searching for log requests for a given application in a specific time span.

You have an application ID \(cdccd920-384b-4a25-897d-75161a4b74c1\) and a relative UTC time 2019-09-29T19:09, you would like to view MS Graph request for a +- 3 minute time span.

1. In the **Start Time** edit control enter 2019-09-29T19:09 - 3 minutes, 2019-09-29T19:06
1. In the **End Time** edit control enter 2019-09-29T19:09 + 3 minutes, 2019-09-29T19:12
1. In the **Application id** edit control enter the application ID value:
cdccd920-384b-4a25-897d-75161a4b74c1

1. click  ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png) 

![Search with appid](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-AppID-Fixed-Timespan.png =600x500)

### Searching for a specific HTTP Response in a given time span

You have an application ID \(cdccd920-384b-4a25-897d-75161a4b74c1\) and a relative UTC time 2019-09-29T19:09, you would like to view MS Graph request for a +- 3 minute time span that have either 200 or 401 as a response code using a +- 3 minute time span.

1. In the **Start Time** edit control enter 2019-09-29T19:09 - 3 minutes, 2019-09-29T19:06
1. In the **End Time** edit control enter 2019-09-29T19:09 + 3 minutes, 2019-09-29T19:12
1. In the **Application id** edit control enter the application ID value: 
cdccd920-384b-4a25-897d-75161a4b74c1
1. In the **Status Code\(s\)**, enter the status codes of interest separated by a , like: \"401,200\" no need for quotes.
1. click  ![Run Button](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-Run-Button.png)
  
![Search with appid](.attachments/AAD-Developer/Shared-Assests/MS-Graph-Node-AppID-Fixed-Timespan-With-Status.png =600x500)

## Caveats and important behavior information

This section contains insights and behaviors discovered during testing of the Microsoft Graph Node.  Use this section to help you use information provided by the node within other ASC pages.

1. If you leave the MS Graph node display, all data is lost and you will need to repeat the query.
1. The MS graph node is tightly coupled to the tenant from which the node is activated. If the request information does not appear in the query results, its possible that the activity was not performed on the current tenant.  You will need to fall back to a more generic query using Kusto Explorer.
1. The default time span is +- 4 minutes from the current UTC time.
1. None of the input parameters for the MS Graph node support any type of wildcards or expressions.  They are all textual edit controls.
1. If you enter a end time without a start time, no results will be returned.
1. To use the default window for time, enter a start time only, leave the end time blank.  The node will use the default time window for the query. 
1. Application ID (AppId or ClientId) for Graph Explorer node in Azure Support Center (ASC) is **a57aca87-cbc0-4f3c-8b9e-dc095fdc8978**

## Transcluded templates (1)
 
 

- Template: MBIInfo
([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fShared%2fMBIInfo%0d))
