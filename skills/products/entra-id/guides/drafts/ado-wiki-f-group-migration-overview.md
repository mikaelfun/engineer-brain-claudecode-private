---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/Group Migration Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Connect%20Sync/Object%20sync/Group%20Migration%20Overview"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Synchronization
- cw.comm-sync
--- 
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
:::template /.templates/Shared/compliance-notice.md
:::

[[_TOC_]]


<br />

# Glossary

|     ObjectGUID                                         |     OG       |
|--------------------------------------------------------|--------------|
|     Ms-Ds-Consistency-Guid                             |     CG       |
|     ObjectGUID                                         |     OG       |
|     SourceAnchor                                       |     SA       |
|     Active Directory                                   |     AD       |
|     Active Directory Connector Space (AADConnect)      |     ADCS     |
|     Azure AD                                           |     AAD      |
|     Azure AD  Connector Space (AADConnect)             |     AADCS    |
|     Metaverse (AADConnect)                             |     MV       |

<br />

<br />

# Disclaimer

<br />

As with any Active Directory migration, these steps should be tested by the Customer before implementing in a production environment.
Please note that it?s not supported to merge group members from both forests, only one AD Connector can sync the "**members**" attribute at a time.

<br />

<br />

# Description

<br />

This article described the expected experience in Entra Connect ADSync when migrating groups between on-premises AD forests.
This was tested in a lab with Entra Connect v2.1.1.0, but there?s no reason for newer versions to behave differently. 

Although the end result will be the same, depending on the order of the AD forests, the experience will be slightly different. Our lab server has the following AD Connector configuration:

- 1st AD Connector: FABRiK.net
- 2nd AD Connector: Contoso.lab

This means the "FABRiK.net" connector's import/sync/export run profiles are always executed before the (2nd) "Contoso.lab" Connector's, as shown in the picture above:

![img](.attachments/AAD-Synchronization/997359/GroupMigration01.png)


<br />

<br />

# Group Migration - From 1st AD Connector to 2nd AD Connector

<br />

In this scenario the source group object is in the 1st AD Connector "FABRiK.net" and is getting migrated to the 2nd AD Connector's Forest "Contoso.lab".

> Source Forest: FABRiK.lab
>
> Target Forest: Contoso.lab


Details from the Source group in Forest "FABRiK.net", synced to Entra OD, which is going to be migrated to the target AD Forest "Contoso.lab":

- Source Group object in "FABRiK.net" Forest:

```
PS C:\> Search-ADSyncToolsADobject -Identity groupmigration1

DistinguishedName     : CN=GroupMigration1,OU=AADC01,OU=Sync,DC=FABxxK,DC=net
ObjectClass           : group
Name                  : GroupMigration1
ObjectGUID            : a6346f8d-95e5-xxxxx-xxx
ObjectSID             : S-1-5-21-25xxxxxx-xxxxx647-4190
mS-DS-ConsistencyGuid :
sAMAccountName        : GroupMigration1
CanonicalName         : FABxxK.net/Sync/AADC01/GroupMigration1
msDS-PrincipalName    : FABxxIK\GroupMigration1
```

- Synced group object in Entra ID: ()

```
>     Get-MgGroup -Filter "displayName eq 'GroupMigration1'" | Format-List

DeletionTimestamp            : 
ObjectId                     : 5c3xxx-xxxx5-d7a990911207
ObjectType                   : Group
Description                  : 
DirSyncEnabled               : True
DisplayName                  : GroupMigration1
LastDirSyncTime              : 3/1/2023 9:52:19 PM
Mail                         : 
MailEnabled                  : False
MailNickName                 : GroupMigration1
OnPremisesSecurityIdentifier : S-1-5-xxxxxxxx-xxx- 6647-4190
ProvisioningErrors           : {}
ProxyAddresses               : {}
SecurityEnabled              : True 
```

> **Note:** Entra ID does not expose the ImmutableID attribute for group objects. See WI from 2018 [Epic 470856: As an IT Admin, I would like Group's ImmutableID to be exposed via Graph/PowerShell](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/470856).

- Source Group object in AADCS:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration02.png)


To convert the AD group's OG in base64 (sourceAnchor/ImmutableId) format, use:

```
PS C:\> ConvertTo-ADSyncToolsImmutableID 'a6346f8d-95e5-404e-ba22-e7b2e3194e4c'

jW80puWVTkC6Iuey4xlOTA==
```

Please note that all the following values correspond to the same identifier:
- Base64: `jW80puWVTkC6Iuey4xlOTA==`
- GUID: `a6346f8d-95e5-404e-ba22-e7b2e3194e4c`
- HEX: `8D 6F 34 A6 E5 95 4E 40 BA 22 E7 B2 E3 19 4E 4C`

<br />

## 1 ? Group is migrated to the new AD Forest ("Contoso.lab")

With an Active Directory migration tool, a new group is created in the Target Forest, making sure the target group has the same CG as the source group?s SA value.

```
PS C:\> Search-ADSyncToolsADobject -Identity GroupMigration1

DistinguishedName     : CN=GroupMigration1,OU=SYNC,DC=Contoso,DC=lab
ObjectClass           : group
Name                  : GroupMigration1
ObjectGUID            : eeexxx-xxx-xxx-fe4040dafc
ObjectSID             : S-1-5-xxxxx-xxx-xxx
sAMAccountName        : GroupMigration1
CanonicalName         : Contoso.lab/SYNC/GroupMigration1
msDS-PrincipalName    : CONTOSO\GroupMigration1
UserPrincipalName     :  
```

- mS-DS-ConsistencyGuid in AD (HEX)

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration03.png)

<br />

## 2 ? Group is joined in the Metaverse
  
<br />

After adding the target group into sync scope, it will Join with the source group in the Metaverse:
  
<br />

a) Delta Import on Target Forest - Target group imported:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration04.png)
  
<br />

b) Delta Sync on Target Forest - Target Group Joined:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration05.png)
  
<br />

c) Export to AAD - Nothing is exported:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration06.png)
  
<br />

d) Target Group ADCS object properties and Lineage:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration07.png)

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration08.png)

**Note:** At this point, also make sure that the members shown in the target group are the same as the source group.
  
<br />

e) MV Object properties:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration09.png)

> **Note:** Contributing MA is still the Source Forest.

f) MV Connectors Tab:
  
<br />

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration10.png)

> **IMPORTANT NOTE:** MV object has 1 AAD Connector + 2 AD connectors showing that both, the source and target groups, have been joined together in MV.

<br />

## 3 ? Source group is removed from sync scope
  
<br />

a) Source Group is deleted from AD CS

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration11.png)
  
<br />

b) Export Flow updates the AAD Object with the new properties coming from the target Forest:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration12.png)

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration13.png)

 > **Note:** CloudAnchor and SourceAnchor stays the same so AAD group is also the same object, it only gets the updated attributes (see "modify" above). When the members of source/target group are the same, you should NOT see any changes in member attribute.
  
<br />

c) MV object

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration14.png)

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration15.png)

> **Note:** At this point, the Contributing MA is the target forest and there?s only 1 AAD Connector + 1 AD Connector.

<br />

<br />

# Group Migration - From 2nd AD Connector to 1st AD Connector

<br />

The above experience might be slightly different depending on the order of the Forests. To illustrate that let's invert the source and target forests:

In this scenario, the source group is in the Forest "Contoso.lab", synchronized to Entra ID, and is getting migrated to the target forest "FABRiK.net":

- Source Forest: Contoso.lab

- Target Forest: FABRiK.net
  
<br />

## 1 ? Group is migrated to the new AD Forest (FABRiK.net)

 With an Active Directory migration tool, a new group is created in the Target Forest, making sure that the target group has the same CG as the source group?s SA value.
  
<br />

## 2 ? Group is joined in the Metaverse

After adding the target group into sync scope, it will Join with the source group in the Metaverse. However, since the AD Connector for the target forest ("FABRik.net") has a higher priority over the AD Connector for the Source Forest ("Contoso.lab"), the newly added target group will immediately update the group object in MV, and consequently, update the group object in Entra ID.

This means that the target group takes over the Entra ID object as soon as it?s added into sync scope, while in the previous scenario, the target group only takes over the AAD object after the source group is removed from sync scope. 

This is an important consideration mainly because you need to make sure the group membership is correct on the target group before it?s added into sync scope.
  
<br />

a) Delta Import on Target Forest: Target group imported  

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration16.png)
  
<br />

b) Delta Sync on Target Forest: Target Group Joined and get?s updated with the properties from the target object.

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration17.png)
  
<br />

c) Export to AAD: Group ?s properties are updated in Entra ID:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration18.png)

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration19.png) 
  
<br />

d) Target Group ADCS object properties and Lineage:
 
  ![img](.attachments/AAD-Synchronization/997359/GroupMigration20.png)

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration21.png)
 
<br />

e) MV Object properties:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration22.png)

> **Note:** Contributing MA is the Target Forest already.
 
<br />

f) MV Connectors Tab:

  ![img](.attachments/AAD-Synchronization/997359/GroupMigration23.png)

> **IMPORTANT NOTE:** MV object has 1 AAD Connector + 2 AD connectors showing that both, the source and target groups, have been joined together in MV.
 

<br />

<br />


