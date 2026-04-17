---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/Managing OnPremises Attributes in Entra ID with ADSyncTools"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Connect%20Sync/Object%20sync/Managing%20OnPremises%20Attributes%20in%20Entra%20ID%20with%20ADSyncTools"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
- cw.AAD-CloudSync
---

[[_TOC_]]

<br />

# Description

This article describes how to use the ADSyncTools PowerShell module to manage OnPremises attributes for user objects in Microsoft Entra ID.

Starting October 2024, supported OnPremises user attributes can be managed directly in Entra ID through Microsoft Graph. This is particularly useful for customers who disabled DirSync before August 2023, where synchronized OnPremises attributes may remain populated with stale values.

Previously, clearing these attributes required opening a support case and raising a CRI to clear the data from the backend. With the introduction of Microsoft Graph support, this scenario is now customer selfservice, and CRI escalations for this purpose are no longer required.

> **Important:** This article applies only to user objects. Other object types are not supported.

<br />

# Introduction
The following is a list of user OnPremises attributes covered in this scenario::

- onPremisesDistinguishedName
- onPremisesDomainName
- onPremisesImmutableId
- onPremisesSamAccountName
- onPremisesSecurityIdentifier
- onPremisesUserPrincipalName

> **Note:** NetBIOSName is not a public attribute, is not exposed in the Azure portal or Microsoft Entra admin center, and there is no supported scenario that requires exposing it. There are currently no known issues caused by stale NetBIOSName values. If any issues are observed, please engage the SCIM Identity  Sync & Provisioning EEE team [SCIM Identity - Sync & Provisioning EEE team](mailto:azidentity-synceee@microsoft.com).

As of October 2024, the supported OnPremises attributes can be updated via Microsoft Graph (beta endpoint) using the user resource type. As this relies on the beta endpoint, behavior is subject to change.

These attributes can be updated only for:
*   Native cloudonly users, or
*   Converted users where the Source of Authority (SoA) has been transferred from onpremises Active Directory to Entra ID by disabling DirSync on the tenant (i.e. `onPremisesSyncEnabled == null`).

**Not supported:**  
User objects that were removed from sync scope and later restored from the Entra recycle bin will have `onPremisesSyncEnabled == false` and are not supported by this functionality.

The Entra ID roles that can update on-premises attributes are:

- Global Admin
- User Admin
- Hybrid Identity Admin

The Microsoft.Graph scopes required for managing on-premises attributes are:
*   Read attributes: `User.Read.All`
*   Set or clear attributes: `User.ReadWrite.All`


The following table summarizes known Customer scenarios where OnPremises attributes can be used:

| **Attribute**                    | **Scenarios**                                                  | 
|----------------------------------|----------------------------------------------------------------|
| **OnPremisesSamAccountName**     | On-prem SSO, CBA                                               |
| **OnPremisesDomainName**         | On-prem SSO, WHfB                                              |
| **OnPremisesDistinguishedName**  | Dynamic AUs and groups. PTA and Exchange Hybrid configuration  |
| **OnPremisesSecurityIdentifier** | On-prem SSO, WHfB                                              |
| **OnPremisesUserPrincipalName**  | App proxy                                                      |

<br />

# Using ADSyncTools PowerShell module

Prerequisites for managing On-premises attributes with ADSyncTools PowerShell module:
- [PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows)
- [Microsoft Graph SDK PowerShell module](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0)


In order to use ADSyncTools you need to install the module from [PowerShell Gallery](https://www.powershellgallery.com/packages/ADSyncTools), as follows:

  ```powerShell
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Install-Module ADSyncTools
  ```

> **Note:** The minimum required version to manage OnPremises attributes in Entra ID is **v1.5.1**. If the module is already installed, you can update it with `Update-Module ADSyncTools`

Follow the next commands to start using ADSyncTools:

- Import ADSyncTools module

  `Import-Module ADSyncTools`

- See the cmdlets available for managing OnPremises attributes:

  `Get-Command *onpremises* -Module ADSyncTools`

  Result:
  ```
  CommandType     Name                                               Version    Source
  -----------     ----                                               -------    ------
  Function        Clear-ADSyncToolsOnPremisesAttribute               1.5.1      ADSyncTools
  Function        Get-ADSyncToolsOnPremisesAttribute                 1.5.1      ADSyncTools
  Function        Set-ADSyncToolsOnPremisesAttribute                 1.5.1      ADSyncTools
  ```

- Get all the details of a cmdlet (i.e., Syntax, Examples, etc) with `Get-Help <cmdlet> -Full`:

  `Get-Help Get-ADSyncToolsOnPremisesAttribute -Full`

<br />

# Get users with OnPremises attributes

Get one user or all users containing OnPremises properties in Entra ID

## Get-ADSyncToolsOnPremisesAttribute


This function can be used to get the onpremises attributes listed below from all users or a specific user in Entra ID:
- onPremisesDistinguishedName
- onPremisesDomainName
- onPremisesImmutableId
- onPremisesSamAccountName
- onPremisesSecurityIdentifier
- onPremisesUserPrincipalName

**Notes:** 
- It only returns the users that have onpremises attributes populated.
- By default, it returns all cloud-only users, but you can specify -IncludeSyncedUsers to return all users, including users synced from on-premises AD.
- Requires Microsoft Graph PowerShell SDK, authenticated with: Connect-MgGraph -Scopes "User.Read.All"


```
SYNTAX
    Get-ADSyncToolsOnPremisesAttribute [-Identity] <String> [[-Property] <String[]>] [<CommonParameters>]

    Get-ADSyncToolsOnPremisesAttribute [[-IncludeSyncedUsers]] [[-Property] <String[]>] [<CommonParameters>]

EXAMPLES
    -------------------------- EXAMPLE 1 --------------------------

    # Get the onpremises attributes of all cloud-users that have onpremises attributes populated.
    Get-ADSyncToolsOnPremisesAttribute

    -------------------------- EXAMPLE 2 --------------------------

    # Get the onpremises attributes of all users that have onpremises attributes populated.
    Get-ADSyncToolsOnPremisesAttribute -IncludeSyncedUsers

    -------------------------- EXAMPLE 3 --------------------------

    # Get the onpremises attributes for one specific user (pipelining)
    'User1@Contoso.com' | Get-ADSyncToolsOnPremisesAttribute

    -------------------------- EXAMPLE 4 --------------------------

    # Get only specific onpremises attributes of a user (pipelining)
    'User1@Contoso.com' | Get-ADSyncToolsOnPremisesAttribute -Property @('onPremisesSyncEnabled','onPremisesImmutableId')

    -------------------------- EXAMPLE 5 --------------------------

    # Export onpremises attributes of all the users
    Get-ADSyncToolsOnPremisesAttribute | Export-Csv backupOnpremisesAttributes.csv -Delimiter ';'
``` 

<br />

# Clean OnPremises attributes

Clear OnPremises attributes on a cloud user in Entra ID

> **IMPORTANT **
> When working with a Customer in clearing OnPremises attributes from Entra ID users in production, please ask to backup all the user's OnPremises properties as a safety recommendation. You can backup all the values with the following command:
>
> `Get-ADSyncToolsOnPremisesAttribute | Export-Csv backupOnpremisesAttributes.csv -Delimiter ';'`

Requires Microsoft Graph PowerShell SDK, authenticated with: Connect-MgGraph -Scopes "User.ReadWrite.All"

## Clear-ADSyncToolsOnPremisesAttribute

This function can be used to clear any of the OnPremises attributes listed below:
- onPremisesDistinguishedName
- onPremisesDomainName
- onPremisesSamAccountName
- onPremisesSecurityIdentifier
- onPremisesUserPrincipalName
- onPremisesImmutableId *

> \* For safety reasons the onPremisesImmutableId is not included in -All parameter because this attribute was never cleared as part of DirSync disablement. Keeping onPremisesImmutableId populated is not harmful and can allow you to hard-match an existing on-premises AD user with the Entra ID user. 
If you also want to clear the onPremisesImmutableId use the -BodyParameter option or run `Clear-ADSyncToolsOnPremisesAttribute` with '-onPremisesImmutableId' parameter (and any other attribute parameters) instead of -All.


```
SYNTAX
    Clear-ADSyncToolsOnPremisesAttribute [-Identity] <String> [[-onPremisesDistinguishedName]] [[-onPremisesDomainName]] [[-onPremisesImmutableId]] [[-onPremisesSamAccountName]]
    [[-onPremisesSecurityIdentifier]] [[-onPremisesUserPrincipalName]] [<CommonParameters>]

    Clear-ADSyncToolsOnPremisesAttribute [-Identity] <String> [-BodyParameter] <String> [<CommonParameters>]

    Clear-ADSyncToolsOnPremisesAttribute [-Identity] <String> [-All] [<CommonParameters>]


EXAMPLES
    -------------------------- EXAMPLE 1 --------------------------

    PS > Clear all onpremises attributes (pipelining)
    'User1@Contoso.com' | Clear-ADSyncToolsOnPremisesAttribute -All


    -------------------------- EXAMPLE 2 --------------------------

    PS > Clear only onPremisesDistinguishedName attribute
    Clear-ADSyncToolsOnPremisesAttribute -Identity '98765432-6f08-40b2-8b66-123456789012' -onPremisesDistinguishedName


    -------------------------- EXAMPLE 3 --------------------------

    PS > Clear all onpremises attributes explicitly
    Clear-ADSyncToolsOnPremisesAttribute 'User1@Contoso.com'  -onPremisesDistinguishedName  -onPremisesDomainName `
                                                              -onPremisesImmutableId -onPremisesSamAccountName `
                                                              -onPremisesSecurityIdentifier -onPremisesUserPrincipalName

    -------------------------- EXAMPLE 4 --------------------------

    PS > Clear all onpremises attributes based on a json parameter body (-BodyParameter)
    $jsonBody = @'
    {
    "onPremisesDistinguishedName": null,
    "onPremisesDomainName": null,
    "onPremisesImmutableId": null,
    "onPremisesSamAccountName": null,
    "onPremisesSecurityIdentifier": null,
    "onPremisesUserPrincipalName": null
    }
    '@
    Clear-ADSyncToolsOnPremisesAttribute -Identity $userId -BodyParameter $jsonBody

```

<br />


# Set OnPremises attributes

Set OnPremises attributes for a cloud user in Entra ID

> **IMPORTANT**
> When working with a Customer in setting OnPremises attributes from Entra ID users in production, please ask to backup all the user's OnPremises properties as a safety recommendation. You can backup all the values with the following command:
>
> `Get-ADSyncToolsOnPremisesAttribute | Export-Csv backupOnpremisesAttributes.csv -Delimiter ';'`

## Set-ADSyncToolsOnPremisesAttribute

This function can be used to set any of the OnPremises attributes listed below:
- onPremisesDistinguishedName
- onPremisesDomainName
- onPremisesImmutableId
- onPremisesSamAccountName
- onPremisesSecurityIdentifier *
- onPremisesUserPrincipalName

It also supports clearing an attribute if an empty string "" is specified (see examples).
Requires Microsoft Graph PowerShell SDK, authenticated with: Connect-MgGraph -Scopes "User.ReadWrite.All"

> \* Must have the correct Security Identifier format, e.g.: "S-1-5-21-4097605469-3104078553-1111111111-1111"

Setting an onPremisesSecurityIdentifier or onPremisesImmutableId that already exists on a different object, will throw the following "ObjectConflict" error. The onPremisesSecurityIdentifier and onPremisesImmutableId must be unique across your Entra ID tenant.

```
[{"code":"ObjectConflict","message":"Another object with the same value for property onPremisesImmutableId already exists.","target":"onPremisesImmutableId"},
{"code":"ConflictingObjects","message":"Another object with the same value for property onPremisesImmutableId already exists.","target":"User_<GUID of the other object in conflict>"}],
```

```
SYNTAX
    Set-ADSyncToolsOnPremisesAttribute [-Identity] <String> [[-onPremisesDistinguishedName] <String>] [[-onPremisesDomainName] <String>] [[-onPremisesImmutableId] <String>] [[-onPremisesSamAccountName]
    <String>] [[-onPremisesSecurityIdentifier] <String>] [[-onPremisesUserPrincipalName] <String>] [<CommonParameters>]

    Set-ADSyncToolsOnPremisesAttribute [-Identity] <String> [-BodyParameter] <String> [<CommonParameters>]


EXAMPLES
    -------------------------- EXAMPLE 1 --------------------------

    PS > Set only onPremisesImmutableId (pipelining)
    'User1@Contoso.com' | Set-ADSyncToolsOnPremisesAttribute -onPremisesImmutableId 'nofCJe0gZk6D8J4gRgrt+A=='

    -------------------------- EXAMPLE 2 --------------------------

    PS > Set onPremisesSamAccountName and clear onPremisesImmutableId
    Set-ADSyncToolsOnPremisesAttribute 'User1@Contoso.com' -onPremisesSamAccountName 'User1' -onPremisesImmutableId ""

    -------------------------- EXAMPLE 3 --------------------------

    PS > Set each onpremises attributes explicitly
    Set-ADSyncToolsOnPremisesAttribute 'User1@Contoso.com' -onPremisesUserPrincipalName "User1@Contoso.com" `
                                                           -onPremisesDistinguishedName "CN=User1,OU=Sync,DC=Contoso,DC=com" `
                                                           -onPremisesDomainName 'Contoso.com' `
                                                           -onPremisesImmutableId 'nofCJe0gZk6D8J4gRgrt+A==' `
                                                           -onPremisesSamAccountName 'User1' `
                                                           -onPremisesSecurityIdentifier "S-1-5-21-4097605469-3104078553-1111111111-1111"

    -------------------------- EXAMPLE 4 --------------------------

    PS > Set onpremises attributes based on a json parameter body (-BodyParameter)
    $jsonBody = @'
    {
    "onPremisesDistinguishedName": "User1@Contoso.com",
    "onPremisesDomainName": 'Contoso.com',
    "onPremisesImmutableId": 'nofCJe0gZk6D8J4gRgrt+A==',
    "onPremisesSamAccountName": 'User1',
    "onPremisesSecurityIdentifier": "S-1-5-21-4097605469-3104078553-1111111111-1111",
    "onPremisesUserPrincipalName": "User1@Contoso.com"
    }
    '@
    Set-ADSyncToolsOnPremisesAttribute -Identity '98765432-6f08-40b2-8b66-123456789012' -BodyParameter $jsonBody
```

<br />

# Action Plan - Customer Ready

Please follow this action plan to clear all the User's OnPremises attributes in you Cloud Users from Entra ID.

Prerequisites for managing On-premises attributes with ADSyncTools PowerShell module:

- [PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows)
- [Microsoft Graph SDK PowerShell module]()

1 - Install and import ADSyncTools (minimum required version 1.5.1):

```
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Install-Module ADSyncTools # If ADSyncTools is not installed, or;

Update-Module ADSyncTools # If ADSyncTools is already installed

Import-Module ADSyncTools
```
 

2 - Connect to Microsoft Graph. Requires Microsoft Graph PowerShell SDK, authenticated with: 

```
Connect-MgGraph -Scopes "User.ReadWrite.All"
```

3 - Before clearing OnPremises attributes from Entra ID users in production, backup all the user's OnPremises properties as a safety recommendation, in case you need to roll back the operation. You can backup all the current values with the following command:

```
Get-ADSyncToolsOnPremisesAttribute | Export-Csv backupOnpremisesAttributes.csv -Delimiter ';'
```


4 - Clear all OnPremises attributes for all cloud users in Entra ID

This function can be used to clear all the OnPremises attributes listed below: 

- onPremisesDistinguishedName 
- onPremisesDomainName 
- onPremisesImmutableId 
- onPremisesSamAccountName 
- onPremisesSecurityIdentifier 
- onPremisesUserPrincipalName 

```
Get-ADSyncToolsOnPremisesAttribute | Select-Object id | Clear-ADSyncToolsOnPremisesAttribute -All -Verbose
```

5 - To confirm that all users have been cleared, run:

```
Get-ADSyncToolsOnPremisesAttribute 
```

> **Note:** If nothing is returned, it means there's no users with OnPremises properties. You can also confirm in Azure Portal or Entra Admin center if the user's OnPremises properties have been cleared successfully.
 




<br />

<br />
