---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/Azure_Active_Directory_Authentication_over_REST/TSGs/Azure Active Directory with Azure Files OAuth over REST_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAzure_Active_Directory_Authentication_over_REST%2FTSGs%2FAzure%20Active%20Directory%20with%20Azure%20Files%20OAuth%20over%20REST_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.Workflow
- cw.Reviewed-06-2024
---




[[_TOC_]]

# Overview

Azure Files now supports OAuth-based authentication and authorization support using Azure Active Directory (AAD) for REST-based access.  Users, groups, 1P services such as Azure Portal, 3P services, and applications using REST interface to access Azure Files can now use OAuth authentication and authorization mechanism to access Azure Files.  In addition, PowerShell cmdlets and Azure CLI, which calls REST APIs, can also use OAuth to access Azure Files. 

The REST API OAuth support is limited to FilesREST Data APIs that support operations on [files](https://learn.microsoft.com/en-us/rest/api/storageservices/operations-on-files) and [directories](https://learn.microsoft.com/en-us/rest/api/storageservices/operations-on-directories).  OAuth is unsupported on FilesREST data plane APIs that manage [FileService](https://learn.microsoft.com/en-us/rest/api/storageservices/operations-on-the-account--file-service-) resource and [FileShare](https://learn.microsoft.com/en-us/rest/api/storageservices/operations-on-shares--file-service-) resource.  These management APIs get exposed through the data plane for legacy reasons.  Therefore, using the control plane APIs (the storage resource provider - Microsoft.Storage) for all management activities related to FileService and FileShare resources is recommended. 

# Support Scope

> :exclamation: IMPORTANT: We updated the routing rules on 06/2024 for the topics below to redirect traffic from the PaaS developer storage pod to the IaaS storage team. Please refer to the training sections below for a refresher. 

|SAP Path|Routing POD|
|:----|:----|
| Azure/Storage Account Management/Alerts, Metrics and Logging | Azure Storage Mgmt |
| Azure/Storage Account Management/Alerts, Metrics and Logging/Files Storage | Azure Storage Mgmt |

## Customer use cases

OAuth authentication and authorization with Azure Files over the REST API interface can benefit customers in various scenarios, including: 

**Application development and service integrations**

OAuth authentication and authorization enable developers to build applications that access Azure storage REST APIs using user or application identities from Azure Active Directory.  

Customers/Partners can also enable 1P and 3P services to configure necessary access securely and transparently to a customer storage account.  

DevOps tools such as the Azure portal, PowerShell and CLI, AZ Copy, and storage explorer can manage data using the user's identity, eliminating the need to manage or distribute all-powerful storage access keys. 

 

**Managed Identities**

Customers with applications and managed identities that require access to file share data for backup, restore, or auditing purposes can benefit from OAuth authentication and authorization.  However, enforcing file and directory-level permissions for each identity adds complexity and may not be compatible with specific workloads.  

For instance, customers may want to authorize a backup solution service to access Azure File shares with read-only access to all files without regard to file-specific permissions. 

**Storage Account key replacement**

Customers can replace Storage Account Key access with OAuth authentication and authorization to access Azure File shares with read-all/write-all privileges.  This approach offers better audit/tracking around access mechanisms, and Azure AD provides superior security and ease of use over shared keys and is recommended by Microsoft. 

Note: The current Azure Files OAuth over REST preview feature aims to enable privileged read and write data access to Azure Files using OAuth.  It is to allow 1P services and administrator access to Azure Files.  It also helps customers switch from storage account key access to OAuth for admin workflows for better auditing and tracking purposes. 

## Built-in roles and data actions

To leverage the Azure Files OAuth over REST feature.  Specific permissions must be included in the RBAC role assigned to the user, group, or service principal.  We introduced two new data actions as part of this feature are 

- Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action 

- Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action 

Users, groups, or service principals that call the REST API with OAuth need either the readFileBackupSemantics or writeFileBackupSemantics assigned to the role allowing data access.  This is a requirement for this feature.  For details on the permissions required to call specific File service operations, see [Permissions for calling data operations](https://learn.microsoft.com/en-us/rest/api/storageservices/authorize-with-azure-active-directory#permissions-for-calling-data-operations). 

As part of the preview release, two new built-in roles include these new actions.  

| **Role** | **Data actions** |
|----------|------------------|
| Storage File Data Privileged Reader | `Microsoft.Storage/storageAccounts/fileServices/fileShares/files/read`<br>`Microsoft.Storage/storageAccounts/fileServices/readFileBackupSemantics/action` |
| Storage File Data Privileged Contributor | `Microsoft.Storage/storageAccounts/fileServices/fileShares/files/read`<br>`Microsoft.Storage/storageAccounts/fileServices/fileShares/files/write`<br>`Microsoft.Storage/storageAccounts/fileServices/fileShares/files/delete`<br>`Microsoft.Storage/storageAccounts/fileServices/writeFileBackupSemantics/action`<br>`Microsoft.Storage/storageAccounts/fileServices/fileshares/files/modifypermissions/action` |

These new roles are similar to the existing  Storage File Data SMB Share Reader and Storage File Data SMB Share Elevated Contributor built-in roles but are not the same. 

The differences are as follows. 

- The new roles contain the additional data actions that are required for OAuth access 

- When the user, group or service principal that is assigned Storage File Data Privileged Reader or Storage File Data Privileged Contributor roles calls the FilesREST Data API using OAuth, the user, group, or the service principal will have 

    - Storage File Data Privileged Reader: full read access on all the data in the shares for all the configured storage accounts regardless of the file/directory level NTFS permissions that are set. 

    - Storage File Data Privileged Contributor: full read, write, modify ACLs, delete access on all the data in the shares for all the configured storage accounts regardless of the file/directory level NTFS permissions that are set. 

- With these special permissions and roles, the system will bypass any file/directory level permissions and allow access to file-share data  

In summary, this functionality will provide storage account-wide privileges that will supersede all permissions on files and folders under all file shares in the storage account.  It is important to note that any wildcard use cases are defined for the following path(s) - Microsoft.Storage/storageAccounts/fileServices/* or higher scope - will automatically inherit the additional access and permissions granted through this new data action.  


## Accessing file data using Azure AD authentication

### Portal

The Azure portal can use either your Azure AD account or the storage account access key to access file data in an Azure storage account.  Which authorization scheme the Azure portal uses depends on the Azure roles that are assigned to you.

When you attempt to access file data, the Azure portal first checks whether you've been assigned an Azure role with Microsoft.Storage/storageAccounts/listkeys/action.  If you've been assigned a role with this action, the Azure portal uses the account key to access file data via shared key authorization.  If you have yet to be assigned a role with this action, the Azure portal attempts to access data using your Azure AD account.

To access file data from the Azure portal using your Azure AD account, you need permission to access file data and to navigate through the storage account resources in the Azure portal.  The built-in roles provided by Azure grant access to file resources but don't grant permissions to storage account resources.  For this reason, access to the portal also requires assigning an Azure Resource Manager (ARM) role, such as the Reader role, scoped to the level of the storage account or higher.  The Reader role grants the most restrictive permissions, but any ARM role that gives access to storage account management resources is acceptable.

For more information about data access in the portal, see [Choose how to authorize access to file data in the Azure portal](https://learn.microsoft.com/en-us/azure/storage/files/authorize-data-operations-portal).

### PowerShell
Azure provides extensions for PowerShell that enable you to sign in and call PowerShell cmdlets using Azure AD credentials.  When you sign into PowerShell with Azure AD credentials, an OAuth 2.0 access token is returned.  PowerShell automatically uses that token to authorize subsequent data operations against file storage.  You no longer need to pass an account key or SAS token with the command for supported operations.

You can assign permissions to file data to an Azure AD security principal via Azure RBAC.

For more information about data access in the Azure PowerShell, see [Choose how to authorize access to file data in Azure PowerShell](https://learn.microsoft.com/en-us/azure/storage/files/authorize-oauth-rest?tabs=powershell#authorize-access-using-filerest-data-plane-api)

### CLI

Core Azure CLI commands that ship as part of CLI support Files OAuth over REST interface, and you can use them to authenticate and authorize file data operations using Azure AD credentials.

For more information about data access in the Azure CLI, see [Choose how to authorize access to file data in Azure CLI](https://learn.microsoft.com/en-us/azure/storage/files/authorize-oauth-rest?tabs=cli#authorize-access-using-filerest-data-plane-api)

### Azure SDKs

The Azure Identity client library simplifies getting an OAuth 2.0 access token for authorization with Azure AD via the [Azure SDK](https://github.com/Azure/azure-sdk). In addition, the latest Azure Storage client libraries for .NET, Java, Python, JavaScript, and Go integrate with the Azure Identity libraries for each language to provide a simple and secure means to acquire an access token for authorization of requests from the Azure file service.

An advantage of the Azure Identity client library is that it enables you to use the same code to acquire the access token, whether your application runs in the development environment or in Azure. The Azure Identity client library returns an access token for a security principal. When your code runs in Azure, the security principal may be a managed identity for Azure resources, a service principal, or a user or group.  In the development environment, the client library provides an access token for either a user or a service principal for testing purposes.

The access token returned by the Azure Identity client library is encapsulated in a token credential. You can then use the token credential to get a service client object to perform authorized operations against the Azure Files service.

A sample code for performing OAuth operations against the Azure File service is available here: https://learn.microsoft.com/en-us/azure/storage/files/authorize-oauth-rest?tabs=cli#authorize-access-to-file-data-in-application-code

#Training

## Azure Files PG brownbag

- [CSS Deep Dive - Files REST OAuth](https://microsofteur.sharepoint.com/:li:/t/dante/E3WGIBkPSJdIsdIeqGP4ImMB22xwEAjDY5LjtqmOYqUQ5Q?e=QT5wRS)

## Training - Dev POD brownbags

<details closed>
<summary>(<span style="color:blue">Click to expand</span>)<span style="color:red"> Due to recent security measures, we are advised to discontinue use of Postman Cloud. Please read to familimarize yourself with suggested altenatives, i.e. Isomnium etc.</span> </summary>
<br>
Discontinue use of Postman Cloud 

You have been identified as a recent user of Postman Cloud. 
 
A security investigation within Microsoft has identified security risks associated with the usage of **Postman Cloud**, a widely used application for developers testing remote web APIs. These risks are primarily linked to **Postman Cloud's** unsafe and insecure handling of secrets and sensitive data.

**Note:** For more technical information behind this concern, please see [Postman Security Risks and Remediation](https://microsoft.bl-1.com/h/i/dwlQk2c6/Nb76gGc?url=https://aka.ms/PostmanRemediation).

<span style="color:red">Action Required by July 31, 2024</span> 
*Note: If you have already discontinued use of Postman through a separate remediation effort, simply record your completion in the form listed in Step 3.*

<u>Secure and Remove Postman Data</u>

1.	Log in to Postman
  a.	Open Postman and navigate to the History tab.
2.	Review Entries
  a.	Check all entries with an “Authorization” header or other sensitive headers.
  b.	Rotate any credentials associated with these entries.
3.	Review URL-based Authorizations
  a.	Check entries using URL-based authorization (e.g., SAS keys for Azure Storage, pre-signed AWS URLs, web hooks).
  b.	Rotate any credentials associated with these entries.
4.	Clear History and Close Account
  a.	After ensuring all sensitive data is secure, clear your Postman history.
  b.	Close your Postman account to prevent further data sync to the cloud.

<u>Alternative Applications:</u>

1.	[Visual studio](https://microsoft.bl-1.com/h/i/dwlQk608/Nb76gGc?url=https://learn.microsoft.com/en-us/aspnet/core/test/http-files?view=aspnetcore-8.0) - (including rich support for secrets)
2.	[Insomnia](https://microsoft.bl-1.com/h/i/dwlQkBPB/Nb76gGc?url=https://insomnia.rest/) -  While Insomnia does require an account, they have explicitly implemented features (such as [end-to-end encryption](https://microsoft.bl-1.com/h/i/dwlQkHoD/Nb76gGc?url=https://docs.insomnia.rest/insomnia/security-features)) to ensure that their servers never see any sensitive information. Additionally, there is a version of Insomnia that removes these features: [Insomnium](https://microsoft.bl-1.com/h/i/dwlQkMBG/Nb76gGc?url=https://github.com/ArchGPT/insomnium).
3.	[Bruno](https://microsoft.bl-1.com/h/i/dwlQkSbJ/Nb76gGc?url=https://www.usebruno.com/) - Also a commonly-used and secure alternative, and offline only.
4.	[PowerShell’s Invoke-RestMethod](https://microsoft.bl-1.com/h/i/dwlQkXzL/Nb76gGc?url=https://powershellcookbook.com/recipe/Vlhv/interact-with-rest-based-web-apis)
5.	[Curl](https://microsoft.bl-1.com/h/i/dwlQlcNN/Nb76gGc?url=https://curl.se/docs/httpscripting.html)
6.	[Edge Developer Tools](https://microsoft.bl-1.com/h/i/dwlQljnQ/Nb76gGc?url=https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/overview)

 
Thank you,
 
Digital Security & Resilience

</details>


- [(EMEA_NA) CSS Deep Dive _ Azure Files SMB shares REST API with OAuth authentication _ Basics of handling REST API by Dev Storage](https://microsofteur.sharepoint.com/:li:/t/dante/EwFK2IvzklxBnvhEEBX4A6kBIBsRDXKwZzZWzlKCBb8FWw?e=oddjQu)
- [(APAC_India) CSS Deep Dive _ Azure Files SMB shares REST API with OAuth authentication _ Basics of handling REST API by Dev Storage](https://microsofteur.sharepoint.com/:li:/t/dante/E7gbp6YYoo1GrvUrVLrZBPwBoX7uNh0Pdy0LcmF3VmBBfA?e=vkrOge)
- [PaaS Developer POD Global - 2021-05-23-Storage authentication troubleshooting - All Documents (sharepoint.com)](https://microsoft.sharepoint.com/teams/DeveloperPODglobal/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x012000B2A2766B65F8F341A3847F9E84BA6D94&id=%2Fteams%2FDeveloperPODglobal%2FShared%20Documents%2FGeneral%2FAzure%20Dev%20Ready%20Training%20Files%2FStorage%2FStorageDevReady%2F2021%2D05%2D23%2DStorage%20authentication%20troubleshooting&viewid=a1bed48c%2D45d3%2D4753%2Da22e%2D1741c93a59f1)

## Dev POD Wikis on this topic

- [RBAC Architecture](https://supportability.visualstudio.com/AzureDev/_wiki/wikis/Dev_Storage/1833166/RBAC-at-Data-Plane)
- [RBAC Direct and Inherited permissions](https://supportability.visualstudio.com/AzureDev/_wiki/wikis/Dev_Storage/1833165/RBAC-Direct-and-Inherited-Permissions)


# More Information

- [Access Azure file shares using Microsoft Entra ID with Azure Files OAuth over REST](https://learn.microsoft.com/en-us/azure/storage/files/authorize-oauth-rest?tabs=portal)

