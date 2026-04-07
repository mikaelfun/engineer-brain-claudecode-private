---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/How to Check for Logs using Kusto and Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/How%20to%20Check%20for%20Logs%20using%20Kusto%20and%20Jarvis"
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
- Sign-Ins
- Queries
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

These are just additional queries that you can use. Their results do not have too much details. Use [ASC](https://aka.ms/supportcenter) to check the audit logs and sign-in logs for a tenant.

# Kusto Logs
**Cluster**: https://idsharedcus.kusto.windows.net/IAMK8s
Database: IAMK8s

**Tables**: RequestEvent, DiagnosticEvent

**Filter**: NamespaceName == reporting


##Audits

     cluster("Idsharedcus").database("IAMK8s").RequestEvent
     | where env_time > datetime(2020-12-04T18:00) and env_time < datetime(2020-12-14T21:00)
     | where NamespaceName == "reporting"
     | where request_name contains "/auditLogs/directoryaudits"
     | where user_tenantId == "1ba64f34-####-####-####-############"
     | order by env_time desc 
   

##Sign-ins

    cluster("Idsharedcus").database("IAMK8s").RequestEvent
    | where env_time > datetime(2020-12-04T18:00) and env_time < datetime(2020-12-14T21:00)
    | where NamespaceName == "reporting"
    | where request_name contains "/auditLogs/signIns"
    | where user_tenantId == "1ba64f34-####-####-####-############"
    | order by env_time desc 


To check if the customer has a Premium 1 license before e.g. 10 days ago
         
    cluster("Idsharedcus").database("IAMK8s").DiagnosticEvent
    | where env_time > ago(10d)
    | where user_tenantId  == "1ba64f34-####-####-####-############" 
    | where message contains "Premium1"
    | project env_time, message, user_tenantId    
    | order by env_time asc

#Jarvis Logs
**Namespaces**: IAMK8sPROD, IAMK8sFF, IAMK8sMC

**Tables**: RequestEvent, DiagnosticEvent

**Filter**: NamespaceName == reporting

Sample Query for finding success sign in requests: https://jarvis-west.dc.ad.msft.net/6B1DB3D7
