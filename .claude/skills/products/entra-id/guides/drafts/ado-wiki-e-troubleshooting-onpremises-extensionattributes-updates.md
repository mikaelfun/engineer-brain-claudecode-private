---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/Troubleshooting onPremisesExtensionAttributes updates"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20sync%2FTroubleshooting%20onPremisesExtensionAttributes%20updates"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]

<br />

# Description

This article covers the different behaviors that are expected to see when trying to update onPremisesExtensionAttributes with Microsoft Graph.
There's a known limitation when updating onPremisesExtensionAttributes on a object that has 
The behaviors described in this article about updating onPremisesExtensionAttributes via Graph might change in the future, depending on how and when PG decides to [Remove support for multi-authority properties and constructs of single authority metadata](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/1908437/).


# Introduction

<br />

## Microsoft Graph

Here's some Microsoft Graph examples for managing onPremisesExtensionAttributes in Azure AD.

To update onPremisesExtensionAttributes of an Azure AD user via Microsoft Graph use the following call:

`PATCH (beta) https://graph.microsoft.com/beta/users/<objectId or UPN>`

With the following data in the body:

```
{
    "onPremisesExtensionAttributes": {
        "extensionAttribute2": "Updated with Graph"
    }
}
```

To get onPremisesExtensionAttributes from an Azure AD user object via Microsoft Graph use the following call:

`GET (beta) https://graph.microsoft.com/beta/users/<objectId or UPN>`

And in the response you should get:

```
    ],
    "onPremisesExtensionAttributes": {
        "extensionAttribute1": null,
        "extensionAttribute2": "Updated with Graph",
        "extensionAttribute3": null,
        "extensionAttribute4": null,
        "extensionAttribute5": null,
        "extensionAttribute6": null,
        "extensionAttribute7": null,
        "extensionAttribute8": null,
        "extensionAttribute9": null,
        "extensionAttribute10": null,
        "extensionAttribute11": null,
        "extensionAttribute12": null,
        "extensionAttribute13": null,
        "extensionAttribute14": null,
        "extensionAttribute15": null
    },
```

<br />

## _SingleAuthorityMetadata attribute

The SingleAuthorityMetadata metadata attribute specifies the authority for each single-authority attribute of the object and is only visible via DSExplorer. It's stamped by the authority seizure or authority transfer process which occurs during Azure AD tenants DirSync enablement or disablement operation, respectively.

The values in SingleAuthorityMetadata contain the following fields: 

- attributeSetName (key, immutable):  name of the attribute set containing the attributes that are the subject of this value. This is typically the "iab" attribute set which corresponds to the set of attributes managed in Exchange Online.

- exchangeMastered: true if Exchange is authoritative for all single-authority attributes in the attribute set identified by attributeSetName; otherwise, false. 

- version: integer that starts at 1 and is incremented whenever one or more fields in the value is modified or  for optional fields  added or removed. 

- lastVersionSeized (optional): value of the version field just prior to the last authority seizure; absent if no seizure has been performed.

A fresh new object provisioned in Azure AD, either synced from on-premises or not, does not contain a SingleAuthorityMetadata. As of today, this property is only stamped during authority transfer/seizure. In the past, the SingleAuthorityMetadata was also stamped by the BackSync process when the object was provisioned in EXO to become an Exchange recipient, but with the BackSync deprecation the SingleAuthorityMetadata seems to be on route to be discontinued since it was not implemented in the new Dual-Write API.

However, as of today, an authority transfer process (i.e. when Customer disables DirSync on the tenant), all synced and cloud-only objects are stamped with a `_SingleAuthorityMetadata: ExchangeMastered=True.` which can cause an issue updating onPremisesExtensionAttributes in Azure AD, as described below in this article.


#  Updating onPremisesExtensionAttributes via Microsoft Graph

<br />

## Scenario A - Synced user with _SingleAuthorityMetadata

In this case, since the user is synced from on-premises AD, it's not possible to update the user in Azure AD: DirSyncEnabled=true / ExchangeMastered=False

```
_ObjectClass (1): User
_ObjectId (1): 164d285a-80a4-48a8-bcb5-47f196b6319d
_SingleAuthorityMetadata (1): (AttributeSetName="iab", ExchangeMastered=False, Version=3, LastVersionSeized=2, MetadataExtensions=[empty])
DirSyncEnabled (1): true
LastDirSyncTime (1): 2018-04-10T06:37:06Z
SourceAnchor (1): EiZ7L4VagEqYn9/3ZumEfw==
UserPrincipalName (1): UserMBX1@Contoso.net
```
Trying to update this user's onPremisesExtensionAttributes via Graph will result in a "Request_BadRequest", as shown below:

```
> Query:
PATCH (beta) https://graph.microsoft.com/beta/users/164d285a-80a4-48a8-bcb5-47f196b6319d

> Body:
{
    "onPremisesExtensionAttributes": {
        "extensionAttribute2": "Updated with Graph"
    }
}

> Response:
{
    "error": {
        "code": "Request_BadRequest",
        "message": "Unable to update the specified properties for on-premises mastered Directory Sync objects or objects currently undergoing migration.",
        "innerError": {
            "date": "2023-02-17T01:22:59",
            "request-id": "22e0aabc-9acb-4673-9c8d-2433d54bd1ed",
            "client-request-id": "a266fbca-8b33-9549-5b86-da97c20d2f75"
        }
    }
}
```
### Results

This scenario works as expected. Graph update/patch call fails because this is an object mastered from on-premises AD.

**Note:** This object has a `_SingleAuthorityMetadata:ExchangeMastered=False` with `Version=3` because:
- v1: was stamped by BackSync when the user was provisioned with an EXO Mailbox;
- v2: when the object went through an authority transfer (DirSynced to cloud-only);
- v3: An authority seizure (cloud-only back to DirSynced) which occurred when the user was synced again from on-premises AD and hard-matched with this object.

<br />

## Scenario B  A pure cloud-only user without mail (not an EXO recipient)

As expected, Microsoft Graph can successfully update a pure cloud-only user which doesn't have any Exchange licenses (AzureAD-mastered/ cloud-only). This object is referenced as a "pure cloud-only object" to describe a state where the object has never been through a DirSync enablement or disablement, hence it doesn't contain a _SingleAuthorityMetadata attribute:

```
_ObjectClass (1): User
_ObjectId (1): 015851c9-e4c0-4bd4-b89e-69c3ea370573
_WhenCreated (1): 2018-12-12T23:15:54Z
_WhenChanged (1): 2023-02-17T01:07:09Z
ExtensionAttribute2 (1): {###ched ###h ###ph}
UserPrincipalName (1): {###udOnlyUser1@nualexEEE.onmicrosoft.com}
```
Trying to update this user's onPremisesExtensionAttributes via Graph is successful (204 response).

```
> Query:
PATCH (beta) https://graph.microsoft.com/beta/users/CloudOnlyUser1@Contoso.onmicrosoft.com

> Body:
{
    "onPremisesExtensionAttributes": {
        "extensionAttribute2": "Updated with Graph"
    }
}

> Response:
No Content - 204 - 576ms
```

### Results
Works as expected. Graph update is successful because its a pure cloud-only user which doesnt have _SingleAuthorityMetadata and doesnt exist in EXO.

<br />

## Scenario C  A pure cloud-only user with mail (EXO recipient)

Since a Mail value was set in AAD, the object gets provisioned in EXO, it becomes an EXO recipient, but it **does not** contain a `_SingleAuthorityMetadata: ExchangeMastered=True.` since it was never synced from on-premises and the tenant has not been DirSync disabled.

You can see that the user is an Exchange Recipient with the following cmdlet:

```
PS C:\> Get-Recipient -Identity 'CloudOnlyUser2@Contoso.onmicrosoft.com' | select *

Alias                              : CloudOnlyUser2
AuthenticationType                 : Managed
ExternalDirectoryObjectId          : feb745fc-38c2-4840-9142-2cd21f42effc
EmailAddresses                     : {SMTP:CloudOnlyUser2@Contoso.onmicrosoft.com}
ExternalEmailAddress               : 
IsDirSynced                        : False
Name                               : CloudOnlyUser2
RecipientType                      : MailUser
RecipientTypeDetails               : MailUser
WindowsLiveID                      : CloudOnlyUser2@Contoso.onmicrosoft.com
ExchangeGuid                       : 00000000-0000-0000-0000-000000000000
ExchangeVersion                    : 1.1 (15.0.0.0)
ObjectClass                        : {user}
WhenChanged                        : 2/17/2023 2:31:28 AM
WhenCreated                        : 2/17/2023 2:31:28 AM
WhenChangedUTC                     : 2/17/2023 2:31:28 AM
WhenCreatedUTC                     : 2/17/2023 2:31:28 AM
ExchangeObjectId                   : feb745fc-38c2-4840-9142-2cd21f42effc
```

Trying to update this user's onPremisesExtensionAttributes via Graph is successful (204 response).

```
> Query:
PATCH (beta) https://graph.microsoft.com/beta/users/CloudOnlyUser2@nualexeee.onmicrosoft.com

> Body:
{
    "onPremisesExtensionAttributes": {
        "extensionAttribute2": "Updated with Graph"
    }
}

> Response:
No Content - 204 - 377ms
```

Not only the Graph patch call works, but the new value is also ForwardSynced to EXO. To see the onPremisesExtensionAttributes from EXO side you need to look at the CustomAttribute# attributes:

```
PS C:\> Get-Recipient -Identity 'CloudOnlyUser2@Contoso.onmicrosoft.com' | select custom*

CustomAttribute1  : 
CustomAttribute2  : Updated with Graph
CustomAttribute3  :  
```


### Results
This works as expected. Graph update is successful because its a pure cloud-only user which doesnt have _SingleAuthorityMetadata. Since its an object provisioned in EXO, ForwardSync also takes care of synchronizing the value with EXO. 

> **Note:** This shows that a "pure" cloud-only object in Azure AD, that is mastered in EXO, doesn't have any issues with updating onPremisesExtensionAttributes through Graph.

## Scenario D (issue)  User with EXO license which existed during DirSync disablement

In this case the user as an EXO license/mailbox which makes it an Exchange mastered account, but is no longer a "pure" cloud-only account since this object existed during a DirSync disablement operation, so it has been marked with `_SingleAuthorityMetadata: ExchangeMastered=True.`.

In this state, it's not possible to update onPremisesExtensionAttributes:

```
> Query:
PATCH (beta) https://graph.microsoft.com/beta/users/cloudonly1@EEE.NuAlex.net

> Body:
{
    "onPremisesExtensionAttributes": {
        "extensionAttribute2": "Updated with Graph"
    }
}

> Response:
{
    "error": {
        "code": "Request_BadRequest",
        "message": "Unable to update the specified properties for objects that have originated within an external service.",
        "innerError": {
            "date": "2023-02-17T01:10:16",
            "request-id": "2815efbb-2277-4de8-a6d8-c33b096eb5d7",
            "client-request-id": "467672fc-e06f-99e2-466e-952b06123909"
        }
    }
}
```

### Results

Unexpectedly, Graph is blocked from updating this objects onPremisesExtensionAttributes, although its a similar object to the previous "Scenario C  A pure cloud-only user with mail (EXO recipient)". The only difference is that when DirSync was disabled, this object was present on the tenant so the authority transfer process marked it with a `_SingleAuthorityMetadata` attribute. Since this object has always been a cloud only object, mastered in EXO, its not clear why authority transfer would touch this object. 

However, 
that was never synced from on-premises AD,
(i.e. DirSyncEnabled attribute was never set, which is not the same as DirSyncEnabled being null), 

with _SingleAuthorityMetadata:ExchangeMastered=True should be treated the same way as an object without _SingleAuthorityMetadata

<br />

# Conclusion

One would assume that a cloud-only object, which is mastered in Exchange (i.e, Exchange recipient), which doesn't have a _SingleAuthorityMetadata property set (Scenario C) should behave the same as a cloud-only object that has `SingleAuthorityMetadata:ExchangeMastered=True` (Scenario D), because they both represent the same SoA (Cloud-only and Exchange-mastered). However, this is not the case for onPremisesExtensionAttributes (possibly other attributes).

<br />

# Workaround

Until there's a resolution for WI to [Remove support for multi-authority properties and constructs of single authority metadata](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/1908437/), Customer will be unable to update onPremisesExtensionAttributes via Graph for objects in Scenario D.
As a workaround, Customers can update these properties from EXO side, e.g., with EXO PowerShell:

```
PS C:\> Set-MailUser -Identity CloudMailUser5 -CustomAttribute2 "Updated with EXO PowerShell" 

PS C:\> Get-MailUser -Identity CloudMailUser5 | FL Cust*te2


CustomAttribute2 : Updated with EXO PowerShell

```


<br />


<br />
