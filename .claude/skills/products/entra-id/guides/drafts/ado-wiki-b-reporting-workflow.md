---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/Reporting Workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/Reporting%20Workflow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.Entra ID Logs and Reporting
- Workflow
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

This article describes several activity log flows and explains how different types of data flow through the process. 

###Reporting Workflow Diagram
![image.png](/.attachments/image-de06227a-5509-48cd-aa79-f707e5a8f238.png)

There are 3 layers: 

The **Source of Truth** is where the data or activity logs originate, and these are the reporting partners.  

The **Producer** is a worker role that reads the data from the Source of Truth, transforms it into a readable format, and inserts it into a processed data store such as Kusto, Geneva and Cosmos DB. 

The **Processed Data Store** is storage. 



##Sign-in flow 

![image.png](/.attachments/image-dcc67b7c-7d0b-4a0b-91df-51051c7212b0.png)

###Source of Truth 

ESTS, which collects authentication data, is the source of truth for sign-in logs. Risk events from ISP service and SAS (Strong Authentication Service) events from MFA are also aggregated into the sign-in logs. 

[AD FS sign-ins](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-health-ad-fs-sign-in) can be integrated into the Entra ID sign-ins by using Connect Health. ADCH (on premise hybrid) as shown in the diagram above is the source of truth for ADFS sign-in logs.

###Producer 

The authentication data is processed by Unified Data Ingestion (UDI). UDI reads the data from ESTS and maps the fields in ESTS to the fields in the reporting schema. The data that is not needed is dropped and ESTS transforms the fields into customer-friendly names. 

AD FS sign-ins are also processed by UDI. 

###Processed Data Store 

After the data is processed and transformed, it streams into Kusto and Geneva.  

###Example 

When a user queries sign-in logs via Entra admin center, the portal calls Microsoft Graph API. The request goes through Gateway, which then sends the request to the Reporting Web API (RWA). RWA then retrieves the sign-in logs from Kusto. 

##Microsoft Graph Activity logs flow 

MS Graph is the source of truth for Microsoft Graph activity logs. Unified Data Ingestion (UDI) reads them from MS Graph. 

 
##Audit logs flow 

![image.png](/.attachments/image-ccb35fc8-72c5-44ee-8abb-de004671ab4f.png)

For audit logs, we have several audit partners or sources of truth such as MSODS, Applications, B2C, Conditional Access, Credentials Management, etc. You can find the list of partners in CSS Wiki [Audit Partners' Escalation Paths / Team Owners]( https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183979/Azure-AD-Reporting-Workflow?anchor=audit-partners%27-escalation-paths-/-team-owners). 


Audit data is now being processed by UDI. Previously, it was processed by AAD Log Processor (ALP). UDI reads all the data from various partners' event hubs, transforms the fields into customer-friendly names, and publishes it to Geneva and Cosmos DB. 

For example, when a user queries audit logs via Entra admin center, the portal calls Microsoft Graph API. The request goes through Gateway, which then sends the request to the Reporting Web API (RWA). RWA then retrieves the audit logs from Cosmos DB. 

**Note**: _Audit is a self-service model so the partners are in charge of sending audits for their accounts. The Reporting team takes the data that they send and publishes it to the customers. The Reporting team doesnt have control over the data._  

##Authentication methods report flow 

The tenant crawler calls AD Graph and MS Graph to get info like username, id, isAdmin, user's registered device keys, and more. It also calls the SSPR API to get security questions. Then it transforms them into a suitable data structure, and stores them into Cosmos DB. 

When a user queries about the authentication methods report via Entra admin center, the portal calls Microsoft Graph API. The request goes through Gateway, which then sends the request to the Reporting Web API. RWA retrieves the report from Cosmos DB.  

However for audit logs, the portal still calls Microsoft Graph, and the request passes through the gateway to the Reporting Web API. But instead of retrieving the logs from Kusto, it retrieves the logs from Cosmos DB. 

##Azure Monitor 
 
Azure monitor allows users to stream data to different endpoints and has longer retention periods.  It gets the data from Geneva. 

 
Logs such as sign-in logs, audit logs, and Microsoft Graph activity logs can be sent to the following endpoints using Diagnostic settings in the Entra admin center: 

- Archive to a storage account 

- Stream to an event hub  

- Send to Log Analytics workspace  
