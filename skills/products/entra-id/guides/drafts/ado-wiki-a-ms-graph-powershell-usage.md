---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/MS Graph Powershell/MS Graph PowerShell Usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FMS%20Graph%20Powershell%2FMS%20Graph%20PowerShell%20Usage"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Dev
- cs.AAD-Dev-Powershell
- cw.comm-devex
Author:
- willfid
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::


# How to work with BodyParameter in Microsoft Graph PowerShell          

[[_TOC_]]

# Overview

We will highlight some general Microsoft Graph PowerShell usage scenarios.

# Find the URL used by a command

There are times one needs to know the underlying Microsoft Graph URL for a given Microsoft Graph PowerShell commandlet. Knowing the underlying URL can be helpful for debugging Microsoft Graph related issues.

There can be multiple ways to find out. Below are a couple of techniques one can use.

**Use the Debug switch**  
This switch is documented [here](https://learn.microsoft.com/en-us/powershell/microsoftgraph/troubleshooting?view=graph-powershell-1.0#using--debug). This technique requires Using Connect-MgGraph to authenticate and execute the commandlet. The Debug switch provides a lot more information about the request (including Request URL) and response Here is an example:
```
Get-MgUser -Debug

DEBUG: [CmdletBeginProcessing]: - Get-MgUser begin processing with parameterSet 'List'.
DEBUG: [Authentication]: - AuthType: 'Delegated', TokenCredentialType: 'InteractiveBrowser', ContextScope: 'CurrentUser', AppName: 'Microsoft Graph Command Line Tools'.
DEBUG: [Authentication]: - Scopes: [...].
DEBUG: ============================ HTTP REQUEST ============================

HTTP Method:
GET

Absolute Uri:
https://graph.microsoft.com/v1.0/users

Headers:
FeatureFlag                   : 00000003
Cache-Control                 : no-store, no-cache
User-Agent                    : Mozilla/5.0,(Windows NT 10.0; Microsoft Windows 10.0.26200; en-US),PowerShell/7.5.4
SdkVersion                    : graph-powershell/2.35.1
client-request-id             : bf33d61c-d7ef-47ca-929e-b69be7402383
Accept-Encoding               : gzip,deflate,br

Body:

DEBUG: ============================ HTTP RESPONSE ============================
```

**Use the Find-MgGraphCommand**  
This is documented [here](https://learn.microsoft.com/en-us/powershell/microsoftgraph/find-mg-graph-command?view=graph-powershell-1.0). The advantage with this approach is that one does not need to sign in to Microsoft Entra ID. The returned URL is in relative form

Below is an example:
```
Find-MgGraphCommand -Command Get-MgUser | fl

Command          : Get-MgUser
Module           : Users
APIVersion       : v1.0
Method           : GET
URI              : /users/{user-id}
OutputType       : IMicrosoftGraphUser
ApiReferenceLink : https://learn.microsoft.com/graph/api/user-get?view=graph-rest-1.0
Variants         : {Get, GetViaIdentity}
Permissions      : {User.ReadBasic.All, User.ReadBasic.All, User.Read, AgentIdUser.ReadWrite.IdentityParentedBy}
CommandAlias     :
```
