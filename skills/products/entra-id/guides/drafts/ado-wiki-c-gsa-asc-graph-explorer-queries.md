---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/Global Secure Access - ASC Graph Explorer Queries & Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FInternal%20Docs%2FGlobal%20Secure%20Access%20-%20ASC%20Graph%20Explorer%20Queries%20%26%20Scenarios"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-hybauth
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   



[[_TOC_]]
#Overview
      
Graph Explorer in ASC allows support engineers to retrieve and analyze Global Secure Access (GSA) Private Access traffic logs. These logs are useful for identifying connectivity issues and diagnosing problems. This article provides sample queries to access the logs. In addition, it includes examples of how to query Global Secure Access Private Access and Quick Access applications by filtering application objects based on specific tags using Microsoft Graph.

Scope

This article focuses on troubleshooting and operational scenarios and covers the following:
*   Querying GSA Private Access traffic logs using Graph Explorer in ASC
*   Retrieving Global Secure Access Private Access and Quick Access applications via Microsoft Graph and Microsoft Graph PowerShell
*   Using tag-based filters to validate application configuration and inventory
*   Sharing Microsoft Graph queries with customers to support independent troubleshooting and data collection
      

#Querying GSA Private Access traffic logs using Graph Explorer in ASC
--------------------------------------------------------------------
      
Graph Explorer in ASC allows support engineers to retrieve and analyze Global Secure Access (GSA) Private Access traffic logs. These logs are useful for identifying connectivity issues and diagnosing problems. This article provides sample queries to access the logs.

##Common Troubleshooting Queries

**1. Retrieve the Last 50 Traffic Logs**

   **Query:**

`/networkaccess/logs/traffic?$filter=trafficType eq 'private'&$orderby=createdDateTime desc&$top=50`
   
**Use Case & Benefits:**

*   Provides an overview of recent private network traffic.�
    

*   Helps troubleshooting access to applications by identifying recent connections.

Example : �

you can add more columns and filter based on interesting connection ID= Correlation Vector which can be collected using the traffic tab using Advanced Diagnostics.

![image.png](/.attachments/image-ae021ddc-bcd0-4640-9add-5388a89adf29.png)

**2. Retrieve Traffic Logs for a Specific User**

   **Query:**

`/networkaccess/logs/traffic?$filter=createdDateTime ge startDateTime and createdDateTime lt endDateTime and trafficType eq 'private' and userPrincipalName eq 'userPrincipalName'&$orderby=createdDateTime desc&$top=50`

*   Replace startDateTime and endDateTime with the desired timestamps YYYY-MM-DDTHH:MM:SSZ (e.g., 2025-04-28T00:00:00Z).�
    

*   Replace userPrincipalName with the User Principal Name (UPN) (e.g., user@example.com).

**Use Case & Benefits:**

*   Filters traffic logs for a specific user.�
    

*   Helps investigate user-specific connectivity issues.

**3. Retrieve Traffic Logs for a Specific Destination FQDN**

 **Query:**

`/networkaccess/logs/traffic?$filter=createdDateTime ge startDateTime and createdDateTime lt endDateTime and trafficType eq 'private' and destinationFQDN eq 'destinationFQDN'&$orderby=createdDateTime desc&$top=50`

*   Replace startDateTime and endDateTime with the desired timestamps YYYY-MM-DDTHH:MM:SSZ (e.g., 2025-04-28T00:00:00Z).�
    

*   Replace destinationFQDN with the Fully Qualified Domain Name (FQDN) of the destination (e.g., app.example.com).

**Use Case & Benefits:**
*   Helps troubleshoot destination-specific connectivity issues.�
    

*   Verifies whether private traffic is correctly routed to a destination.�
    

*   Useful for diagnosing application access problems.

**Example** : by selecting one of the transaction it will provide more information related to the request

![image.png](/.attachments/image-3bd2cb63-70ab-42c3-b024-8f8a43229f87.png)

**4. Retrieve Traffic Logs for a Specific Connection ID**

**Query:**

`/networkaccess/logs/traffic?$filter=connectionId eq 'Replace_Correlation_Vector'`

Replace {connectionId} with the actual connection ID you want to filter for.

connectionId =StreamId= correlationVector= Correlation vector= =Af2vVYxk1UKsYYep.0

Example :�

/networkaccess/logs/traffic?$filter=connectionId eq 'Af2vVYxk1UKsYYep.0'

**Use Case & Benefits:**
*   Helps isolate logs related to a specific connection.�
    

*   Useful for diagnosing issues tied to a particular session or network flow.

Example: It is still possible to filter based on the correlation vector, which corresponds to the connection ID.

![==image_0==.png](/.attachments/==image_0==-b8e24cb3-ccbb-4e7c-b8df-d31b5ad75f87.png) 

Expanding the result will provide additional information about the request.

![image.png](/.attachments/image-16b1de1a-3b4a-4e20-8ccf-634e78b6cd72.png)


      

#Querying Global Secure Access Applications using MS Graph or MS Graph PowerShell
--------------------------------------------------------------------------------
      
Retrieving Global Secure Access Private Access and Quick Access applications via Microsoft Graph and Microsoft Graph PowerShell

The MS Graph query looks like this:

```
https://graph.microsoft.com/v1.0/applications?$filter=tags/any(tag: tag eq 'PrivateAccessNonWebApplication')
 
https://graph.microsoft.com/v1.0/applications?$filter=tags/any(tag: tag eq 'NetworkAccessQuickAccessApplication')

https://graph.microsoft.com/v1.0/applications?$filter=tags/any(tag: tag eq 'NetworkAccessQuickAccessApplication') or tags/any(tag: tag eq 'PrivateAccessNonWebApplication')
```

The PS equivalent of this: (Please install Microsoft Graph PS Module first: [link](https://learn.microsoft.com/powershell/microsoftgraph/installation?view=graph-powershell-1.0))
```
Get-MgApplication -Filter "tags/any(tag: tag eq 'NetworkAccessQuickAccessApplication') or tags/any(tag: tag eq 'PrivateAccessNonWebApplication')"
```

In ASC you just need to run the Query below under MSGraph blade

**Note**: The Product Group is actively working on implementing a more user-friendly method for allocating and filtering Global Secure Access. Until that feature is available, you can utilize the following approach.

```
/applications?$filter=tags/any(tag: tag eq 'PrivateAccessNonWebApplication')

If the customer has more than 100 GSA Private Access Apps, use the following MS Graph query to retrieve the full list:

/applications?$filter=tags/any(tag: tag eq 'PrivateAccessNonWebApplication')&$top=999

/applications?$filter=tags/any(tag: tag eq 'NetworkAccessQuickAccessApplication')
```

For Both Private Access and Quick Access Application 

```
/applications?$filter=tags/any(tag: tag eq 'NetworkAccessQuickAccessApplication') or tags/any(tag: tag eq 'PrivateAccessNonWebApplication')
```


#Querying Global Secure Access Private networks
-------------------------------------------------

You can retrieve and review the configuration by using **Microsoft Graph in Tenant Explorer in ASC** with the query below.

**Note:** The Private networks configuration is part of the **ILA** (**Local Intelligent Access**) feature.[[Enable Intelligent Local Network - Global Secure Access | Microsoft Learn](https://learn.microsoft.com/en-us/entra/global-secure-access/enable-intelligent-local-access)

```
 /networkaccess/privateNetworks
```


If you have any feedback on this article or you need assistance, please contact us over [the Global Secure Access channel](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7APian178VKrnYMDXzTO2NUQzdTN1Q1NzNTSFQxRUcyUlAzQ0NCRjVETy4u) to the Hybrid Authentication Experiences Community.
