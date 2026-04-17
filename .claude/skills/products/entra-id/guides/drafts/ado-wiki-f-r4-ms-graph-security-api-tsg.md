---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph Security API/Microsoft Graph Security API TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20Security%20API%2FMicrosoft%20Graph%20Security%20API%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Dev
- cw.AAD-Workflow
- cw.AAD-Dev-MSGraph
- cw.AAD-Dev-MSGraph-Security
- cw.AAD-Dev-Training
- cw.AAD-Dev-TSG
- cw.AAD-Dev-Boundaries
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Dev](/Tags/AAD-Dev) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Dev-MSGraph](/Tags/AAD%2DDev%2DMSGraph) [AAD-Dev-MSGraph-Security](/Tags/AAD%2DDev%2DMSGraph%2DSecurity) [AAD-Dev-Training](/Tags/AAD%2DDev%2DTraining) [AAD-Dev-TSG](/Tags/AAD%2DDev%2DTSG) [AAD-Dev-Boundaries](/Tags/AAD%2DDev%2DBoundaries)                          

:::template /.templates/AAD-Developer/under-construction.md
:::

:::template /.templates/Shared/MBIInfo.md
:::

[[_TOC_]]

# Microsoft Graph Security API

What is Microsoft Graph Security API? [MS Graph Security API Documentation](https://docs.microsoft.com/en-us/graph/security-concept-overview#:~:text=Benefits%20of%20using%20the%20Microsoft%20Graph%20Security%20API,%20Unified%20threat%20management%2C%20prevention%2C%20a%20...%20)  
Below is an illustration of the MS Graph Security API system.  Notice that the MS Graph Security API is a proxy for specific providers.

![MSGraphSecAPIImage](.attachments\AAD-Developer\391550\Illustration-of-MS-Graph-Security-API-System.png)

# **Support Boundaries**

1. How to make generic calls to Microsoft Graph Security API and general questions about proper queries
   - Supported by Azure AD Developer Support
1. Missing alerts or missing information in a alert.
   - Please see known issues below
   - Supported by the Provider team  -    [List of Security API Providers](https://docs.microsoft.com/en-us/graph/api/resources/security-api-overview?view=graph-rest-1.0)

---
## **Using Microsoft Graph Security API**

**GET https://graph.microsoft.com/v1.0/security/alerts**

1. $top/$skip/$skiptoken. Page size limit = 1000. Top+skip limit = 6000
1. $select. Show only limited properties

1. $filter
   - Supports algebraic operators: gt, ge, lt, le, eq, ne 
   - Supports any() for sub-entity search
   - Supports AND/OR  
   - Support enum and string filter

1. Examples

   - $filter=eventDateTime ge 2019-06-03T17:40:20.000000Z and eventDateTime lt 2019-06-04T17:55:20.000000Z&$orderby=eventDateTime desc&$top=200
   - $filter=severity eq microsoft.graph.alertSeverity'high' and status ne microsoft.graph.alertStatus'newAlert' &$top=5
   - $filter=networkConnections/any(d:d/destinationAddress eq 1.2.3.4')

**RESPONSE**  

```
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Security/alerts",
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/security/alerts?$top=10&$skiptoken=7bae3497-7bd0-4c1e-b900-f5d9de2114d1",
  "value": [
    {
      "id": "2518426275486567395_3e85361b-1d1a-402a-a34b-29f5c9670780",
      "azureTenantId": "72f988bf-####-####-####-############",
      "azureSubscriptionId": "0c8d0493-####-####-####-############",
      "riskScore": null,
      "tags": [],
      "activityGroupName": null,
      "assignedTo": null,
      "vendorInformation": {
          "provider": "Office 365 Security and Compliance",
          "providerVersion": null,
          "subProvider": null,
          "vendor": "Microsoft"
      },
      
    },
    {}   ]
}
```

---

# Case Handling

All providers are responsible for mapping their alert data to the Microsoft Graph Security API alert schema. Any details not provided will be based on what the provider has configured. To determine which provider team to involve, collect the information provided in the **'vendorInformation'** property of the alert. (Example above)

Please engage the Providers support team (and the respective support team may need to engage their Engineering Team) for issues with the alert including.
* Missing alerts
* Missing information in the alert
* Invalid data in the alert

The only time where Entra ID Developer support should be engaged when there is an issue for **ALL** alert providers. There is nothing the Entra ID Developer support team nor the MS Graph Security API engineering team can do when there is issue with one specific provider.

### Azure Advanced Threat Protection (Microsoft Defender for Identity)

- vendorInformation/provider: Azure Advanced Threat Protection
- Alert Location: Microsoft Graph Security API Alert Database Store (i.e. "https://isgstore-prod-us.trafficmanager.net/security/alerts")
  - Microsoft Defender for Identity pushes alerts to the Microsoft Graph Security API Alert Database Store
- Patch alerts  Update alerts is not supported 
- Subscribe alerts  Missing support for alert subscription
- Requirements - TBD
- Retention: 7 Days
- Support Team: Azure\Microsoft Defender for Identity (formerly Azure Advanced Threat Protection) (MSaaS Security - Threat Analytics)
- More Information: https://docs.microsoft.com/en-us/defender-for-identity/understanding-security-alerts#security-alert-categories

*** Microsoft Defender for Identity alerts are available via the Microsoft Cloud App Security integration. This means you will get Microsoft Defender for Identity alerts only if you have joined Unified SecOps and connected Microsoft Defender for Identity into Microsoft Cloud App Security. Learn more about how to integrate Microsoft Defender for Identity and Microsoft Cloud App Security.

### Microsoft Defender for Endpoint
    
- vendorInformation/provider: Microsoft Defender ATP
- Alert Location: Microsoft Graph Security API pulls alerts for this provider directly from  "Microsoft Defender for Endpoint" @ "https://api.securitycenter.windows.com/security/alerts"
- Mapping - Only required alert fields are mapped. None of the state information for user, host, network connections, files, malware and processes is mapped for any of the alerts even though the original alert from MDATP contains this information in the MDATP schema.
- Subscribe alerts  Missing support for alert subscription
- Requirements - Additional permissions are needed to access MDATP alerts through the Graph Security API, unlike other providers.
- Retention: TBD
- Direct API: https://docs.microsoft.com/en-us/microsoft-365/security/defender-endpoint/exposed-apis-create-app-nativeapp?view=o365-worldwide
- Support Team: Security\Microsoft Defender\Microsoft Defender for Endpoint\APIs and SIEM

### Office 365 Security and Compliance (Now called Microsoft Purview)

- vendorInformation/provider: Office 365 Security and Compliance
- Alert Location: Microsoft Graph Security API pulls alerts for this provider directly from  "Office 365 Security and Compliance" @ "https://can01b.dataservice.protection.outlook.com/DataInsights/security/alerts"
- Mappings - host, network connections, files, malware and processes is mapped for any of the alerts even though the original alert from Office 365 ATP contains this information. 
- sourceMaterial information is not provided for backlining to the relevant Office alert.  
- Patch alerts  Update alerts is not supported 
- Subscribe alerts  Missing support for alert subscription
- $filter - Not yet supported
- Retention - 90 Days
- Support Team: Security/Microsoft Purview Compliance/DLP alerts

### Azure Security Center

- vendorInformation/provider: ASC
- Alert Location: Microsoft Graph Security API Alert Database Store (i.e. "https://isgstore-prod-us.trafficmanager.net/security/alerts")
  - Azure Security Center pushes alerts to the Microsoft Graph Security API Alert Database Store
- Mappings: TBD
- Alerts have partial information like missing properties like IP information in host state and missing user state information, etc. 
- Retention - 7 Days
- Direct API: https://docs.microsoft.com/en-us/rest/api/securitycenter/alerts
- Support Team: Azure/Microsoft Defender for Cloud (formerly Security Center)/Security Alerts Investigation/Investigating Security Alerts for root cause

### Microsoft Cloud App Security

- vendorInformation/provider: MCAS
- Alert Location: Microsoft Graph Security API Alert Database Store (i.e. "https://isgstore-prod-us.trafficmanager.net/security/alerts")
  - Microsoft Cloud App Security pushes alerts to the Microsoft Graph Security API Alert Database Store
 - Patch alerts  Update alerts is not supported 
- Mappings
   - Alerts have partial information like missing logon properties in user state, missing destination service IP in cloud app states, description of some alerts have additional risk information that needs to be mapped into the states like user and host states as well.  
- E2E support for update  Updates to alerts made through Graph Security integrated applications are not reflected on the MCAS portal and vice versa.
- Retention - 7 Days
- Direct API: https://docs.microsoft.com/en-us/cloud-app-security/api-introduction
- Support Team:
  - API Usage: Azure\Cloud App Security\Integrations with MCAS\REST APIs (MSaaS Security - Threat Analytics)

### Azure Sentinel

- vendorInformation/provider: Azure Sentinel
- Alert Location: Microsoft Graph Security API Alert Database Store (i.e. "https://isgstore-prod-us.trafficmanager.net/security/alerts")
- Mappings
   - None of the state information for user, host, network connections, files, malware and processes is mapped for any of the custom alerts.
- E2E support for update  Updates to alerts made through Graph Security integrated applications are not reflected on Sentinel.
- Direct API: https://docs.microsoft.com/en-us/rest/api/securityinsights/

### Azure AD Identity Protection

- vendorInformation/provider: IPC
- Alert Location: Microsoft Graph Security API Alert Database Store (i.e. "https://isgstore-prod-us.trafficmanager.net/security/alerts")
 - Azure AD Identity Protection pushes alerts to the Microsoft Graph Security API Alert Database Store
- E2E support for update  Updates to alerts made through Graph Security integrated applications are not reflected on AADIP and vice versa.
- Requirements: Azure AD Premium P1 or P2
- Retention - 7 Days
- Direct API: https://docs.microsoft.com/en-us/graph/api/resources/identityprotectionroot?view=graph-rest-1.0
- Support Teams:
  - API usage: Azure AD Developer
  - Review Alerts: Azure AD Authentication

# **HTTP Status codes**

1. 200 OK
1. 206 Partial Content. See warning header for more details. 
1. 400 Bad Request. Unsupported OData filter, invalid PATCH content
1. 403 Forbidden. Missing permissions in access token or user is not authorized (User does not have permission in Provider). 
1. 404 Not Found. Entity is not found by given ID
1. 429 Too Many Requests. Requests are throttled when customers send too many requests in short time.
1. 503 Service Unavailable. Server currently busy, clients should try again.

### **206**

1. WDATP/Office have different role requirements
1. Providers may refuse to serve the tenant due to license limit
1. Providers may not support a $filter phrase or other OData syntax
1. Providers may time out

### **403**

1. Customer applications not registered with proper Graph Permissions
1. Tenant admin did not grant permissions to customer applications
1. For user delegated auth, customers dont have the required roles

#### **Troubleshooting**

1. Parse the auth tokens retrieved from Graph
1. Permission claim: scp for user delegated, roles for app only
1. User role claim: wids

---
## **Troubleshooting**

### **KUSTO**

Data Source: https://isgdev.kusto.windows.net:443  
Permissions:  
<b><i><font color=Orange> Note:</font><font color=purple> When submitting a request for access please include a meaningful justification.  This project's membership is rigidly enforced to protect access to customer data.</font>
</i></b>
</p>

[ISG Logs AADDevSup](https://myaccess/identityiq/accessRequest/accessRequest.jsf?autoSubmit=true#/accessRequest/review?role=ISG%20Logs%20AADDevSup)

1. Kusto > Isgdev > IsgProdDatabase 
   - IsgQueryLogs. 
      - One request per row
       Request HTTP context: method, path, entity, filter, status code, result count, latency


         ```
         IsgQueryLogs. Contains per request info, such as HTTP method, path and query, latency, entity type, result count, etc. 
        | where env_time >= datetime(2020-06-16 22:10) and env_time <= datetime(2020-06-18 22:21) 
        | where tenantId == "b0cee36c-####-####-####-############"
        //| project env_time, tagId, appId, httpMethod, path, ['query'], statusCode, resultCount, latencyInMs
         ```

   - IsgProviderLogs. Contains per-provider info, such as the request URL sent to providers, the provider name, latency, result count, etc. 
      - One provider request per row
      - One customer request can have multiple rows in this table
       Provider context: method, full URI, status code, result count, latency
         ```
         IsgProviderLogs
        | where env_time >= datetime(2020-09-15T23:00:00Z) and env_time <= datetime(2020-09-16T01:00:00Z)
        | where tenantId == "08a83339-####-####-####-############"
        //| where clientId == "934e5a42-####-####-####-############"
        //| where provider == "MCAS"
        //| where resultCount > 0
        | project env_time, name, provider, tagId, pathAndQuery, requestUri, statusCode, resultCount, latencyInMs
        //| summarize count() by name, provider, resultCount
        | sort by env_time asc
         ```

   - IsgAccessLogs. Contains client access info such as tenantId, appOnly or userDelegated, roles of the user, permissions contained in the auth token

   - WebAppLogs. Contains detailed logs for each request, including routing, auth, provider selection, etc. 

---
# **Known Issues**

### **Dont see some alerts from a provider, though customers can see the alerts in providers portal**

1. OData filter is invalid
1. OData filter is not supported by a provider
1. API endpoint for a provider has different retention policy (example: Office only returns alerts within 7 days in GSA, while show one-month alerts in portal)
1. Timing: alerts are not in backend yet

### **Alert contents dont match whats shown on providers portal**
1. Whats on portal can be from multiple sources, not only from alert content
1. Possible schema mapping issue
1. Some content, while in providers internal data schema, is not carried by Graph Security API schema


---
## **Splunk Add-on**

Azure AD Developer Support team does not support the Microsoft Graph Security Splunk Addon that is located here...
https://splunkbase.splunk.com/app/4564/

Microsoft Graph Security Product team supports the Splunk addon.

Customers must open issues and contact the email address provided under Contact support link on this page.

![Splunk Addon support Image](.attachments\AAD-Developer\391550\splunkaddonsupport.jpg)

For additional information about the Splunk addon... 
[Microsoft Graph Security Splunk Addon](.attachments\AAD-Developer\391550\msgraph-security-api-splunk-addon.pdf)

We can do due dillegence checks such as making sure the API call itself works, permissions are set, and there are no authentication errors.

---
## **Escalation**

### **Contacts**

| Team	| Contacts |
| ----- | -------- | 
| Graph Security API	| PreetiKr; StKim; FengZhu
| ASC	| StKim (Graph Store); DotanP; Gilade 
| Sentinel	| StKim (Graph Store); Yafitc; Ravis
| AADIP	| StKim (Graph Store); dKaufman; willsonr
| MCAS	| StKim (Graph Store); oshazan; nigolden
| Azure AATP	| StKim (Graph Store); eymanor; oshazan
| AIP	| StKim (Graph Store); gagang; Ayal.OferLaleh
| MDATP	| Orenl; dalon; alonros
| Office 365 ATP	| Kevinid; carlos.pena

### **IcM**

1. Go to the ICM Portal, choose "Create" 
   - https://aka.ms/icm
1. Owning Service: "Intelligent Security Graph"
1. Owning Team: "SIPS API"
1. Ensure you provide the following details
   - TenantId
   - ApplicationId
   - Provider information
   - If there is a failed and incomplete response
     - Timestamp
     - CorrelationId

### Feature Requests/Issues

You can submit issues and feature requests to the following Github repository...

[Microsoft Graph Security API Github Issues](https://github.com/microsoftgraph/security-api-solutions/issues)

---
# **Training**

1. Deep Dive session 1
   - https://web.microsoftstream.com/video/de7b7fdf-af87-4627-95c3-996876c64dad
   - https://microsoft-my.sharepoint.com/:p:/p/preetikr/EX9wVkIEZFJPgFbP76PPKnkB_LGjcfHbRm4BUPDiF-n70Q?rtime=Qzm2nMrt1kg
1. Deep Dive session 2
   - https://web.microsoftstream.com/video/a6eea463-2c08-4971-b66c-df7aa20e43b0 

## Transcluded templates (2)
 
 

- Template: under-construction([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fAAD-Developer%2funder-construction))
 
 

- Template: MBIInfo([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fShared%2fMBIInfo))
