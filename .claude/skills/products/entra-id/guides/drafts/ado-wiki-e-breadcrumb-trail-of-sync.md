---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object sync/The Breadcrumb Trail of Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FObject%20sync%2FThe%20Breadcrumb%20Trail%20of%20Sync"
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
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Synchronization](/Tags/AAD%2DSynchronization) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Connect](/Tags/AAD%2DConnect)                                                                

<style type="text/css">
<!--
 .tab { margin-left: 40px; }
-->
</style>

[[_TOC_]]

> **NOTE**: There is a Tech Talk session called *"The Breadcrumb Trail of Synchronization"* (recorded in Aug. 17 2020) that goes through this article's contents, available in the [Identity Advanced Training portal](https://microsoft.sharepoint.com/teams/IdentityAdvancedTraining/SitePages/Technical-Calls.aspx).

> **NOTE**: There is a reviewed public version of this article published at [End-to-end troubleshooting of Azure AD Connect objects and attributes](https://docs.microsoft.com/en-us/troubleshoot/azure/active-directory/troubleshoot-aad-connect-objects-attributes)


# Introduction

The intention of this article is to establish a common practice to troubleshoot synchronization issues where an object or attribute is not synchronizing but theres absolutely no clue on what is going on. Its easy to get lost in the details when theres not an obvious error being surfaced, but with this practice you will be able to isolate the issue and provide the best insights for an SME/TA/EEE to help resolve the problem.
So, following *The Breadcrumb Trail of Synchronization* will allow you to troubleshoot the sync engine logic end-to-end and help you be more self-sufficient and able to resolve such synchronization issues more efficiently. Over time, as you apply this method on your support calls, youll be able to identify the issues quicker because you will predict in which step is the issue occurring, determine where is the starting point to look at data and what is the best direction to go from there.

<br />

![img](.attachments/AAD-Synchronization/376714/clip_image002.png)

For learning purposes, the steps presented here start on local AD and move all the way up to Azure AD since this is the common direction of sync. Though, the same principals apply for the inverse direction for attribute writeback issues, for instance.

## Scenarios

An object or attribute not synchronizing to Azure AD with no errors on the Sync Engine, Application Event Viewer logs or Azure AD logs.

## Prerequisites

For better understanding of this article, please read these prerequisite articles first as you need to know already how to search for an object in the different sources (AD, AD CS, MV, etc.) and you also need to know how to check the Connectors and Lineage of an object.

[Troubleshoot an object that is not synchronizing with Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/tshoot-connect-object-not-syncing)

[Troubleshoot object synchronization with Azure AD Connect sync](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/tshoot-connect-objectsync)

## Nomenclature

| Name                                                         | Acronym          |
| ------------------------------------------------------------ | ---------------- |
| Azure AD Connect                                             | AADC             |
| Active Directory Domain Services                             | ADDS or AD            |
| Metaverse                                                    | MV               |
| Connector Space                                              | CS               |
| Azure AD Connector Space                                     | AADCS            |
| Attribute 'A' in Azure AD Connector Space                    | AADCS:AttributeA |
| Attribute 'A' in the Metaverse object                        | MV:AttributeA    |
| Active Directory Connector Space                             | ADCS             |
| Attribute 'A' in Active Directory Connector Space            | ADCS:AttributeA  |
| AD Connector Account                                         | ADCA             |
| AAD Connector Account                                        | AADCA            |
| Automatically generated AD Connector Account (MSOL\_\#\#\#\#\#\#\#\#) | MSOL Account     |
| Access Control Lists (aka ADDS permissions)                  | ACLs             |

<br />
<br />

# Step 1: Synchronization between ADDS and ADCS

## Objective

This first step is about checking if the object/attribute is present and consistent in ADCS - If you are able to locate the object in ADCS and all the attributes have the expected values, you can jump to Step 2.

<br />

![img](.attachments/AAD-Synchronization/376714/clip_image002-1598386877499.png)

## Description

Synchronization between ADDS and ADCS occurs at the Import step which is the moment when AADC reads from the source directory and stores data in the DB, i.e. data is staged in the connector space. During a Delta Import from AD, AADC will request all the new changes that occurred after a given watermark. This call is initiated by AADC using Directory Services Dirsync Control against Active Directorys Replication Service, providing the last watermark since the last successful AD Import which gives AD the point-in-time from when all the (delta) changes should be retrieved. A Full Import is very different because AADC will import from AD all the data (in sync scope) and then will mark as obsolete (and delete) all the objects that are still present in ADCS but were not Imported from AD. All the data between AD and AADC is transferred with LDAP and is encrypted by default.

<br />

![image-20200825132148583](.attachments/AAD-Synchronization/376714/image-20200825132148583.png)

<br />

If connection with AD is successful, but the object/attribute is not present in ADCS then, assuming the domain/object is in sync scope, it is most likely an ADDS permission issue. The ADCA needs to have at least read permissions over the object in AD in order to Import data to ADCS. By default, the MSOL account has explicitly read/write permissions for all User/Group/Computer properties but this might still be a problem if:

a)  Customer decided to use a custom ADCA and did not provide enough permissions;

b)  A parent OU has blocked inheritance which prevents propagation of permissions from the root of the domain;

c)  The object/attribute itself has blocked inheritance which prevents propagation of permissions;

d)  The object/attribute has an explicit Deny ACL that prevents ADCA from reading it;

<br />

## Troubleshooting

### 1. Connectivity with AD

In the Synchronization Service Manager, the Import from AD step shows which DC is contacted under Connection Status. You will most likely see an error here when there is a connectivity issue with AD.

![image-20200825132230502](.attachments/AAD-Synchronization/376714/image-20200825132230502.png)

If you need to further troubleshoot connectivity with AD specially if there is no errors surfaced in AADConnect server or when you are initially installing the product, always start with the [ADConnectivityTool](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-adconnectivitytools#adconnectivitytool-during-installation).

Possible support calls with issues connecting to ADDS can be caused by:

a) Invalid AD credentials, when for instance, the ADCA is expired, or the password has changed;

b) Error 'failed-search' that occurs when DirSync Control fails to communicate with AD Replication Service, which is normally caused by high network packet fragmentation.

c) Other problems caused by name resolution issues, network routing problems, blocked network ports, no writable DCs available, etc; which in that case would be better to have Directory Services or Networking support teams involved.

<br />

#### Troubleshooting Summary

- Identity which DC is being used
- Correctly identify the ADCA
- Use the ADConnectivityTool to identity the problem
- Using the LDP tool, try to Bind against the DC with the ADCA
- Engage Directory Services or Network support team

<br />

### 2. Run the Synchronization Troubleshooter

The [*Troubleshoot Object Synchronization*](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/tshoot-connect-objectsync) tool should be the first thing to do since this step alone can detect the most obvious reasons for an object/attribute not getting synchronized.

![image-20200825132300381](.attachments/AAD-Synchronization/376714/image-20200825132300381.png)

![image-20200825132310822](.attachments/AAD-Synchronization/376714/image-20200825132310822.png)

<br />

### 3. AD Permissions

Lack of AD permissions can affect both ways of the synchronization:

a) When importing from ADDS to ADCS, lack of permissions can cause silent misses of object/attributes where AADC cannot get ADDS updates in the import stream because the ADCA does not have enough permissions to read the object.

b) When Exporting from ADCS to ADDS, lack of permissions in AD will generate a "permission-issue" Export error.

When you open the properties of an AD object and go to Security \> Advanced, you can look at the object's Allow/Deny ACLs and Disable inheritance button (if inheritance is enabled). Ordering the column by 'Type' will help identify all the 'Deny' permissions. AD permissions can vary a lot but by default you might only see 1 Deny ACL for '*Exchange Trusted Subsystem*' and mostly Allow permissions. The most relevant default permissions are:

> Authenticated Users  
> ![image-20200825132343018](.attachments/AAD-Synchronization/376714/image-20200825132343018.png)

> Everyone  
> ![image-20200825132356170](.attachments/AAD-Synchronization/376714/image-20200825132356170.png)

> Custom ADCA or MSOL account  
> ![image-20200825132405544](.attachments/AAD-Synchronization/376714/image-20200825132405544.png)

> Pre-Windows 2000 Compatible Access  
> ![image-20200825132423206](.attachments/AAD-Synchronization/376714/image-20200825132423206.png)

> SELF  
> ![image-20200825132432776](.attachments/AAD-Synchronization/376714/image-20200825132432776.png)

The best way to troubleshoot permissions is to use the "*Effective Access*" feature in AD Users and Computers console which check what are the effective permissions that a given account (i.e. the ADCA) has over the target object/attribute that you want to troubleshoot:

![image-20200825132442889](.attachments/AAD-Synchronization/376714/image-20200825132442889.png)

However, the "*Effective Access*" feature can produce unreliable results. If the issue persists, then manually check if the permissions are correct in the root of the domain and if inheritance is enabled on the object and all parent containers.

We have also seen cases where the ACL is corrupted in AD and you'll need to "Restore Defaults" on the object and its parent containers.

![image-20250415173700](.attachments/AAD-Synchronization/376714/image-20250415173700.png)

<br />

**IMPORTANT NOTE**

Troubleshooting AD permissions can be very tricky because changing ACLs does not take immediate effect. Always take into consideration that such changes are subject to AD replication, i.e.:  

- Make sure you are doing the necessary changes directly on the closest DC (see above "Identity which DC is being used").  
- Wait for ADDS replications to occur or force a full replication from a DC with `repadmin /syncall /APed`
- Restart ADSync service if possible, to clear caching.

<br />

#### Troubleshooting Summary

- Identity which DC is being used
- Correctly identify the ADCA
- Use the [Configure AD DS Connector Account Permissions](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-configure-ad-ds-connector-account) tool
- Use "*Effective Access*" feature in AD Users and Computers
- Using the LDP tool, Bind against the DC with the ADCA and try to read the failing object/attribute.
- Temporarily add the ADCA to the Enterprise Admins or Domain Admins and restart ADSync service - **But don't use this as a solution**. After confirming the permissions issue, remove the ADCA from any highly privileged groups and provide the required AD permissions directly to the ADCA
- Engage Directory Services or Network support team to help troubleshooting/debugging.

<br />

### 4. AD Replications

This is less common to affect AADConnect (since it causes bigger problems) but when AADConnect is importing data from a DC with delayed replication, it will not be importing the latest information from AD. This causes sync issues where an object/attribute recently created/changed in AD does not sync to AAD because it was not replicated to the DC that AADConnect is contacting. To confirm if this is the issue, check what's the DC which AADConnect is using for import (see \#1 Connectivity to AD) and use the AD Users and Computers console to directly connect to this server, then confirm if the data on this server corresponds to the latest data and if it is consistent with the respective ADDS data. At this stage AADC will generate more load on the DC and networking layer.

![image-20200825132635745](.attachments/AAD-Synchronization/376714/image-20200825132635745.png)

Another approach is using RepAdmin tool to check the object's replication metadata on all DCs, get the value from all DCs and check replication status between DCs:

a)  Attribute value from all DCs:

``` dos
repadmin /showattr \* \"DC=contoso,DC=com\" /subtree /filter:\"sAMAccountName=User01\" /attrs:pwdLastSet,UserPrincipalName
```

![image-20200825132647116](.attachments/AAD-Synchronization/376714/image-20200825132647116.png)

b)  Object metadata from all DCs:

``` dos
repadmin /showobjmeta \* \"CN=username,DC=contoso,DC=com\" \> username-ObjMeta.txt
```

![image-20200825132657920](.attachments/AAD-Synchronization/376714/image-20200825132657920.png)

c)  AD Replication Summary

``` dos
`repadmin /replsummary
```

![image-20200825132704200](.attachments/AAD-Synchronization/376714/image-20200825132704200.png)

<br />

#### Troubleshooting Summary

- Identity which DC is being used
- Compare data between DCs
- Analyze RepAdmin results
- Engage Directory Services or Network support team to help troubleshooting/debugging.

<br />

### 5. Domain/OU changes, Object Type or Attribute filtered/excluded in ADDS Connector

a)  Changing Domain/OU Filtering requires a Full Import

Keep in mind that, even if the Domain/OU filtering look ok, any changes to Domain/OU filtering only take effect after running a Full Import step.

b)  Attribute Filtering with Azure AD app and attribute filtering

An easy to miss scenario for attributes not synchronizing is when AADConnect is configured with [Azure AD app and attribute filtering](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-custom#azure-ad-app-and-attribute-filtering) feature. You can check f this feature is enabled and for which attributes by taking a General Diagnostics Report or checking the Global Configuration tab in ASC.

c)  Object Type excluded in ADCS

Probably not so common to occur with Users and Groups, but if all the objects are missing in the ADCS then it might be worthy to check what are the Object Types enabled on the ADDS Connector Space.

See below the object types that should enabled by default:

``` PowerShell
(Get-ADSyncConnector \| where Name -eq \"Contoso.com\").ObjectInclusionList`
```

![image-20200825132844058](.attachments/AAD-Synchronization/376714/image-20200825132844058.png)

> \* in case Mail Enabled Public Folder feature is enabled.

d)  Attribute excluded in ADCS

In the same way, if the attribute is missing for all objects, then you might want to check if the attribute is selected on the AD Connector.

Here is how to get Attributes enabled for the AD Connector:

``` PowerShell
(Get-ADSyncConnector \| where Name -eq \"Contoso.com\").AttributeInclusionList
```

![image-20200825160612128](.attachments/AAD-Synchronization/376714/image-20200825160612128.png)

> NOTE: Including or excluding Object Types or Attributes in the Synchronization Service Manager UI is not supported.

<br />

#### Troubleshooting Summary

- Check the [Azure AD app and attribute filtering](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-custom#azure-ad-app-and-attribute-filtering) feature
- Confirm that the Object Type is included in ADCS
- Confirm that the Attribute is included in ADCS
- Run a Full Import

<br />

## Tools

- ASC
- Get-ADSyncConnectorAccount - Identity the correct Connector account used by AADC
- [ADConnectivityTool](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-adconnectivitytools#adconnectivitytool-during-installation) - Identify connectivity problems with ADDS
- Trace-ADSyncToolsADImport (ADSyncTools) - Trace data being imported from ADDS
- LDIFDE - Dump object from ADDS to compare data between ADDS and ADCS
- LDP - Test AD Bind connectivity and permissions to read object in the security context of ADCA
- DSACLS - Compare and evaluate ADDS permissions
- Set-ADSync\<Feature\>Permissions - Apply default AADC permissions in ADDS
- RepAdmin - Check AD object metadata and AD replication status

Not so useful tools:

- Network trace of a Delta/Full Import step (LDAP traffic is encrypted)
- Fiddler trace (there's no HTTP/S traffic)

<br />

# Step 2: Synchronization between ADCS and MV

<br />

![img](.attachments/AAD-Synchronization/376714/clip_image002-1598396840720.png)

<br />

## Objective

This step is about checking if the object/attribute flows from CS to MV (aka, object/attribute is projected to MV). At this stage you need to be sure that the object is present, or the attribute is correct in ADCS (covered in Step \#1) and then start looking at the Synchronization Rules and Lineage of the object.

<br />

## Description

The Synchronization between ADCS and MV occurs on the Delta/Full Synchronization steps., this is the moment when AADC reads the data in the ADCS, processes all the Sync Rules and updates the respective MV object. This MV object will contain CS links (aka Connectors) pointing to the CS objects that contribute to its properties and the Lineage of sync rules that were applied in the synchronization step. At this stage AADC will generate more load on SQL Server/LocalDB and networking layer.

<br />

## Troubleshooting ADCS \> MV for Objects

<br />

### 1. Check the Inbound Sync Rules for Provisioning

An object that is present in ADCS but missing in MV indicates that there were no Scoping Filters on any of the provisioning Sync Rules that applied to that object (i.e. In from AD* sync rules), hence the object was not projected to MV. This may occur when there are provisioning sync rules disabled or customized by the Customer.

Here is how to get a list of Inbound Provisioning Sync Rules:

``` PowerShell
Get-ADSyncRule \| where {\$\_.Name -like \"In From AD\*\" -and \$\_.LinkType -eq \"Provision\"} \| select Name,Direction,LinkType,Precedence,Disabled \| ft
```

![image-20200825160744902](.attachments/AAD-Synchronization/376714/image-20200825160744902.png)

<br />

### 2. Check the Lineage of the ADCS object

You can retrieve the failing object from the ADCS (I.e. search by "*DN or Anchor*" in "*Search Connector Space*") and look at the Lineage tab. In this tab you will probably see that the object is a *Disconnector* (no links to MV) and the Lineage is empty. This is also a good place to check if the object has any errors, in case there is a sync error tab.

![image-20200825161145667](.attachments/AAD-Synchronization/376714/image-20200825161145667.png)

<br />

### 3. Run a Preview on ADCS object

Go to "Preview..." and Generate + Commit a Preview to see if the object gets projected to MV. If that is the case, then a Full Sync Cycle should fix the issue for other objects in the same situation.

![image-20200825161204025](.attachments/AAD-Synchronization/376714/image-20200825161204025.png)

<br />

### 4. Export the object to XML

For a more detailed analysis (or for offline analysis) you can collect all the database data related with the object by using the Export-ADSyncToolsObjects powershell cmdlet from ADSyncTools Powershell module. This exported information, together with the (Inbound) Sync Rules configuration from ASC will help determine what is the rule that is filtering out the object, in other words, what is the Inbound Scoping Filter in the Provisioning Sync Rules that is preventing the object from being projected to the MV.

[*ADSyncTools Powershell Reference*](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-adsynctools)

Here are some examples of Export-ADsyncObject syntax:

``` PowerShell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
    Import-module -Name "C:\Program Files\Microsoft Azure Active Directory Connect\Tools\AdSyncTools"

Export-ADSyncToolsObjects -DistinguishedName 'CN=User1,OU=ADSync,DC=Contoso,DC=com' -ConnectorName 'Contoso.com'

Export-ADSyncToolsObjects -ObjectId '9D220D58-0700-E911-80C8-000D3A3614C0' -Source Metaverse
```

<br />

### Troubleshooting summary (Objects)

- Check the Scoping filters on the Inbound provisioning rules "In From AD"
- Try a Preview of the object
- Run a Full Sync Cycle
- Export the object data with Export-ADSyncToolsObjects cmdlet

<br />

## Troubleshooting ADCS \> MV for Attributes

<br />

### 1. Identity the Inbound Sync Rules and Transformation Rules of the attribute

Each Attribute have its own set of Transformations Rules responsible to flow the value from ADCS to MV, so the first thing to do here is to identify which sync rule(s) contain the Transformation Rule for the attribute you're troubleshooting.

The best way to identity which sync rules have a Transformation Rule for a given attribute is to use the built-in filtering capabilities of the *Synchronization Rules Editor*.

![image-20200825161358947](.attachments/AAD-Synchronization/376714/image-20200825161358947.png)

<br />

### 2. Check the Lineage of the ADCS Object

Each connector (link) between the CS and MV will have a Lineage that contains information about the Sync Rules applied to that CS object. The previous step will tell you which Inbound sync rules (whether Provisioning or Joining sync rules) must be present in the object's Lineage to flow the correct value from ADCS to MV. By looking at the Lineage on the ADCS object you will be able to confirm if that sync rule has been applied to the object or not.

![image-20200825161410336](.attachments/AAD-Synchronization/376714/image-20200825161410336.png)

In case there's multiple Connectors (AD Forests) linked to the MV object, you may have to look at the *Metaverse Object Properties* to determine which Connector is contributing with the attribute you are trying to troubleshoot (as shown on the example below with 2 AD Connectors) and look at the Lineage of that ADCS object.

![image-20200825161418761](.attachments/AAD-Synchronization/376714/image-20200825161418761.png)

<br />

### 3. Check the Scoping Filters on the Inbound Sync Rule

If a sync rule is enabled but not present in the object's Lineage, then it should be getting filtered out by the sync rule's Scoping Filter. By checking if the sync rule is Enabled/Disabled, the sync rule's Scoping Filter(s) and the data on the ADCS object, you should be able to determine why that Sync Rule was not applied to the ADCS object.

Here is an example of a common troublesome Scoping Filter:

![image-20200825161429551](.attachments/AAD-Synchronization/376714/image-20200825161429551.png)

<br />

### 4. Run a Preview on ADCS object

If you cannot find any reasons for the sync rule missing in the ADCS object's Lineage, then try running a Preview to Generate + Commit the full synchronization of the object. If the attribute gets updated in the MV with a Preview, then a Full Sync Cycle should fix the issue for other objects in the same situation.

<br />

### 5. Export the object to XML

For a more detailed analysis (or for offline analysis) you can collect all the database data related with the object by using the Export-ADSyncToolsObjects powershell cmdlet from ADSyncTools powershell module. This exported information, together with the (Inbound) Sync Rules configuration from ASC will help determine what is the sync rule / transformation rule missing on the object that is preventing the attribute from being projected to the MV (see Export-ADSyncToolsObjects examples above).

<br />

### Troubleshooting summary (Attributes)

- Identity the correct sync rules and transformation rules responsible to flow the attribute to MV
- Check the Lineage of the object
- Check if Sync Rules are enabled
- Check the Scoping Filters of the Sync Rules missing in the object's Lineage

<br />

### Advanced Troubleshooting of Sync Rule Pipeline

If you need to further debug the ADSync engine (aka MiiServer) in terms of Sync Rule processing, you can enable ETW tracing on the config file (C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe.config). This method will generate an extensive verbose text file showing all the processing of sync rules, but it might be hard to interpret all the information so use it as a last resort and only with advisory from a TA/SME/EEE.

<br />

## Tools

- ASC
- Synchronization Service Manager UI
- Synchronization Rules Editor
- Export-ADSyncToolsObjects cmdlet
- Start-ADSyncSyncCycle -PolicyType Initial
- ETW tracing SyncRulesPipeline (miiserver.exe.config)

<br />

# Step 3: Synchronization between MV and AADCS

<br />

![img](.attachments/AAD-Synchronization/376714/clip_image002-1598397313821.png)

<br />

## Objective

This step is about checking if the object/attribute flows from MV to AADCS. At this stage you need to be sure that the object is present, or the attribute is correct in ADCS and MV (covered in Steps \#1-2) and then start looking at the Synchronization Rules and Lineage of the object. This step is very similar to Step 2 where we check the Inbound direction from ADCS to MV, whereas at this stage we are going to concentrate on the Outbound sync rules and attribute flows from MV to AADCS.

<br />

## Description

The Synchronization between MV and AADCS occurs on the Delta/Full Synchronization steps, this is the moment when AADC reads the data in MV, processes all the Sync Rules and updates the respective AADCS object. This MV object will contain CS links (aka Connectors) pointing to the CS objects that contribute to its properties and the Lineage of sync rules that were applied in the synchronization step. At this stage AADC will generate more load on SQL Server/LocalDB and networking layer.

<br />

## Troubleshooting MV \> AADCS for Objects

<br />

### 1. Check the Outbound Sync Rules for Provisioning

An object that is present in MV but missing in AADCS indicates that there were no Scoping Filters on any of the provisioning Sync Rules that applied to that object (i.e. Out to AAD\* sync rules), hence the object was not provisioned in AADCS. This may occur if the there's disabled or customized provisioning sync rules.

Here is how to get a list of Inbound Provisioning Sync Rules:

``` PowerShell
Get-ADSyncRule \| where {\$\_.Name -like \"Out to AAD\*\" -and \$\_.LinkType -eq \"Provision\"} \| select Name,Direction,LinkType,Precedence,Disabled \| ft
```

![image-20200825161532008](.attachments/AAD-Synchronization/376714/image-20200825161532008.png)

<br />

### 2. Check the Lineage of the ADCS object

You can retrieve the failing object from the MV (I.e. using "*Metaverse Search*") and look at the Connectors tab. From this tab you will be able to determine if the MV object is linked (i.e. connected) to an AADCS object. This is also a good place to check if the object has any errors, in case there is a sync error tab.

![image-20200825161555439](.attachments/AAD-Synchronization/376714/image-20200825161555439.png)

If there is no AADCS Connector present, then most likely the object is cloudFiltered=True, so you can confirm if the object is cloudFiltered by looking at the MV Attributes and check which sync rule is contributing with the CloudFiltered value.

<br />

### 3. Run a Preview on AADCS object

Go to "Preview..." and Generate + Commit a Preview to see if the object gets connected to AADCS. If that is the case, then a Full Sync Cycle should fix the issue for other objects in the same situation.

<br />

### 4. Export the object to XML

For a more detailed analysis (or for offline analysis) you can collect all the database data related with the object by using the Export-ADSyncToolsObjects powershell cmdlet from ADSyncTools Powershell module. This exported information, together with the (Outbound) Sync Rules configuration from ASC will help determine what is the rule that is filtering out the object, in other words, what is the Outbound Scoping Filter in the Provisioning Sync Rules that is preventing the object from being connected with the AADCS.

[*ADSyncTools Powershell Reference*](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-adsynctools)

Here are some examples of Export-ADsyncObject syntax:

``` PowerShell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
    Import-module -Name "C:\Program Files\Microsoft Azure Active Directory Connect\Tools\AdSyncTools"

Export-ADSyncToolsObjects -DistinguishedName 'CN=User1,OU=ADSync,DC=Contoso,DC=com' -ConnectorName 'Contoso.com'

Export-ADSyncToolsObjects -ObjectId '9D220D58-0700-E911-80C8-000D3A3614C0' -Source Metaverse
```

<br />

<br />

### Troubleshooting summary (Objects)

- Check the Scoping filters on the Inbound provisioning rules "Out to AAD"
- Try a Preview of the object
- Run a Full Sync Cycle
- Export the object data with Export-ADSyncToolsObjects cmdlet

<br />

## Troubleshooting MV \> AADCS for Attributes

<br />

### 1. Identity the Outbound Sync Rules and Transformation Rules of the attribute

Each Attribute have its own set of Transformations Rules responsible to flow the value from MV to AADCS, so the first thing to do here is to identify which sync rule(s) contain the Transformation Rule for the attribute you're troubleshooting.

The best way to identity which sync rules have a Transformation Rule for a given attribute is to use the built-in filtering capabilities of the *Synchronization Rules Editor*.

![image-20200825161701570](.attachments/AAD-Synchronization/376714/image-20200825161701570.png)

<br />

### 2. Check the Lineage of the ADCS Object

Each connector (link) between the CS and MV will have a Lineage that contains information about the Sync Rules applied to that CS object. The previous step will tell you which Outbound sync rules (whether Provisioning or Joining sync rules) must be present in the object's Lineage to flow the correct value from MV to AADCS. By looking at the Lineage on the AADCS object you will be able to confirm if that sync rule has been applied to the object or not.

![image-20200825161716854](.attachments/AAD-Synchronization/376714/image-20200825161716854.png)

<br />

### 3. Check the Scoping Filters on the Outbound Sync Rule

If a sync rule is enabled but not present in the object's Lineage, then it should be getting filtered out by the sync rule's Scoping Filter. By checking if the sync rule is Enabled/Disabled, the sync rule's Scoping Filter(s) and the data on the MV object, you should be able to determine why that Sync Rule was not applied to the AADCS object.

<br />

### 4. Run a Preview on AADCS object

If you cannot find any reasons for the sync rule missing in the ADCS object's Lineage, then try running a Preview to Generate + Commit the full synchronization of the object. If the attribute gets updated in the MV with a Preview, then a Full Sync Cycle should fix the issue for other objects in the same situation.

<br />

### 5. Export the object to XML

For a more detailed analysis (or for offline analysis) you can collect all the database data related with the object by using the Export-ADSyncToolsObjects powershell cmdlet from ADSyncTools Powershell module. This exported information, together with the (Outbound) Sync Rules configuration from ASC will help determine what is the sync rule / transformation rule missing on the object that is preventing the attribute to flow to AADCS (see Export-ADSyncToolsObjects examples above).

<br />

### Troubleshooting summary (Attributes)

- Identity the correct sync rules and transformation rules responsible to flow the attribute to AADCS
- Check the Lineage of the object
- Check if Sync Rules are enabled
- Check the Scoping Filters of the Sync Rules missing in the object's Lineage

<br />

### Advanced Troubleshooting of Sync Rule Pipeline

If you need to further debug the ADSync engine (aka MiiServer) in terms of Sync Rule processing, you can enable ETW tracing on the config file (C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe.config). This method will generate an extensive verbose text file showing all the processing of sync rules, but it might be hard to interpret all the information so use it as a last resort and only with advisory from a TA/SME/EEE.

<br />

## Tools

- ASC
- Synchronization Service Manager UI
- Synchronization Rules Editor
- Export-ADSyncToolsObjects cmdlet
- Start-ADSyncSyncCycle -PolicyType Initial
- ETW tracing SyncRulesPipeline (miiserver.exe.config)

<br />

# Step 4: Synchronization between AADCS and AzureAD

<br />

![img](.attachments/AAD-Synchronization/376714/clip_image002-1598397483087.png)

<br />

## Objective

This stage is about comparing the AADCS object with the respective object provisioned in Azure AD.

<br />

## Description

There are multiple components involved in the process of Import/Export data from/to Azure AD that can cause issues. Things like the Customer's connectivity to the Internet, internal Firewalls and ISP connectivity problems (e.g. blocked traffic), the Azure AD Gateway in front of DirSync Webservice (aka, AdminWebService endpoint), the DirSync Webservice API itself and the Azure AD Core directory service (aka, service-side issues). Fortunately, the issues related with all these components will most certainly generate an error that can be traced on Kusto and ASC DirSync Webservice Logs, so these are mostly out of scope for this TSG. Nevertheless, there are still some "silent" issues that we can dig in here.

<br />

## Troubleshooting

<br />

### 1. Multiple Active AADC servers exporting to AAD

A typical cause for objects in Azure AD to flip attribute values back and forth, or to respawn deleted users unexpectedly, occurs when there's more than one active AADConnect server exporting data to Azure AD and one of these servers lost contact with local AD but is still connected to the Internet and able to reach Azure AD. So, every time this rogue server containing stale data in AD CS, imports from AAD a new change for a synchronized object that was done by the other "good" active server, the sync engine reverts that change based on its stale AD data and exports a new change to AAD reverting that attribute value again, repeatedly in every sync cycle (i.e very ~30 minutes). This typically creates an infinite loop in every sync cycle where the "good" active server updates the correct information in AAD but the roque active server reverts that same update. The same applies for an object delete, where the rogue server imports an account delete hence it re-provisions (respawns) the same account over and over again based on its stale information about that existent user in ADSync DB.

For more information about this issue please watch the following Tech Talk session: [18 Nov 2020 | Issues caused by rogue AADConnect servers](https://msit.microsoftstream.com/video/9013a1ff-0400-b9eb-ce02-f1eb29bd08d7)

<br />

### 2. Mobile attribute with DirSyncOverrides ([KB2908927](https://internal.evergreen.microsoft.com/en-us/help/2908927))

When the Admin updates the Mobile attribute, the updated phone number will be overwritten in Azure AD regardless of the object being synced from on-premises AD (DirSyncEnabled=true). Along with this update, Azure AD also sets the attribute "DirSyncOverrides = Mobile (1)" on the object to flag that this user had a Mobile phone set from Azure AD. From this point on, any update to the Mobile attribute coming from on-premises will simply be ignored by Azure AD as this attribute is no longer managed from on-prem AD. As of Nov 2022, the PG released a new feature called BypassDirSyncOverrides which provides a way of turning off DirSyncOverrides at the tenant level and prevent this issue from occuring again, or as way of resetting all DirSyncOverrides present in Azure AD and then leave BypassDirSyncOverrides feature disabled again. For more information, please consult the public documentation on [How to use the BypassDirSyncOverrides feature of an Azure AD tenant](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-bypassdirsyncoverrides)

<br />

### 3. ThumbnailPhoto attribute ([KB4518417](https://internal.evergreen.microsoft.com/en-us/help/4518417))

The Set-UserPhoto cmdlet was [discontinued on November 30, 2023](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Ftechcommunity.microsoft.com%2Ft5%2Fexchange-team-blog%2Fdeprecation-of-exchange-online-powershell-userphoto-cmdlets%2Fba-p%2F3955744&data=05%7C02%7CPedro.Covaneiro%40microsoft.com%7C7f05d224f8a340911d0f08dc96cc0149%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638551050181199101%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=SfNY9a6DY8VNFs1YJ3Gi8AueEJ77Zda0JrPnDbDBCtg%3D&reserved=0). Microsoft now recommends using MSGraph with the Set-MgUserPhotoContent command. This means that we are eliminating a significant and longstanding issue where customers had the ability to set the photo in various locations (such as Exchange, AzureAD, on the portal, Sync it via Connect Sync, etc). Currently, the photo can only be set via Graph, directly on the portal or synchronized by Connect Sync. Said so, when troubleshooting the thumbnailphoto attribute using Connect Sync, we should also utilize MSGraph.

To verify if the photo is being properly synced from on-premises, assuming that you do not have any export error in Connect Sync and the attribute is populated in the cloud connector space:

1st  Ensure that the user property is set to the user in Entra ID.

Get-MgUserPhoto -UserId "1d395ec6-bd44-4241-b499-4f9e4e0ff30d" 

 ![image.png](/.attachments/image-4de440aa-c22f-40c7-a6b6-e494f2142478.png)

2nd  Confirm which photo is set on the user in Entra ID. This will download the photo that is set on the user so you can determine if this is a synchronization issue (in case you do not see the photo that is set in AD) or an issue with the UI (in case you see the photo that is set in AD):

Get-MgUserPhotoContent -UserId "1d395ec6-bd44-4241-b499-4f9e4e0ff30d" -OutFile "C:\MS\contoso@contoso.com.png"

 ![image.png](/.attachments/image-aa589cdc-ad4c-4b64-8083-31c4b61f62b9.png)

Note: If the photo is changed directly in AzureAD after the photo is synchronized, Connect Sync will not push again the photo to Entra ID, unless the attribute "thumbnailphoto" is changed again in AD.


### 4. UserPrincipalName changes does not update in Azure AD

When the UserPrincipalName in particular is not getting updated in Azure AD, while other attributes sync normally, then there's 90% chances this is **By Design** because [*SynchronizeUpnForManagedUsers*](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-syncservice-features#synchronize-userprincipalname-updates) feature is not enabled on the tenant. It is incredible the number of times this simple service side feature got new support tickets and even escalations to EEE team due to total lack of knowledge, although it exists since at least the year 2012.

Before this feature, after the user is provisioned in Azure and assigned a license, any updates to the UPN coming from on-premises were 'silently' ignored. An Admin would have to use MsOnline/Azure PowerShell to update the UPN directly in Azure AD. After enabling this feature, any updates to UPN will flow to Azure AD regardless of the user be Licensed (Managed) or not. Once enabled, this feature cannot be disabled.

It's also stunning the number of Customers will simply not believe in the CSS engineer claiming - "*Hey, this always worked correctly before...*" so make sure to demystify that, it works if the user is NOT licensed, but without *[SynchronizeUpnForManagedUsers](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-syncservice-features#synchronize-userprincipalname-updates)* feature, UPN changes after the user is provisioned and gets a licensed assigned will definitely NEVER get updated in AAD. Also, Microsoft does not disable this feature on behalf of the Customer.

To enable the feature run the below commands:

```
$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features.SynchronizeUpnForManagedUsersEnabled = $true
Update-MgDirectoryOnPremiseSynchronization -OnPremisesDirectorySynchronizationId $OnPremSync.Id -Features $OnPremSync.Features
(Get-MgDirectoryOnPremiseSynchronization).Id, (Get-MgDirectoryOnPremiseSynchronization).Features | Format-List
```

**Note:** _SynchronizeUpnForManagedUsersEnabled_ is a tenant level feature that also affects **Cloud Sync** provisioning since this is a [service side feature](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-syncservice-features) and CloudSync also uses DirSync Webservice (aka AdminWebService) to provision objects in EntraID.

The other 10% of situations are most likely an issue exporting the ShadowUserPrincipalName which you can check its value in ASC or DSExplorer, or an (non-printing) invisible character that invalidates the ShadowUserPrincipalName and is dropped by ProxyCalc (see next topic on _Invalid Characters & ProxyCalc black magic_).

<br />

### 5. Invalid Characters & ProxyCalc black magic

Issues with bad characters that do NOT produce any sync error are more troublesome in UserPrincipalName and ProxyAddresses attribute due to the cascading effect in ProxyCalc processing which will 'silently' discard the value coming from on-premises AD, as follows:

a)  The resulting UPN in Azure AD will be the MailNickName or CommonName at Initial Domain. e.g. instead of <John.Smith@Contoso.com> the UPN in AAD might become <smithj@Contoso.onmicrosoft.com> because there's an invisible character in the UPN value coming from on-premises AD.

b)  If a ProxyAddress contains a space character, ProxyCalc will simply discard it and auto-generate an email address based of MailNickName at Initial Domain. e.g: 'SMTP: <John.Smith@Contoso.com>' will not show up in AAD because it contains a space character between 'SMTP:' and the email address.

c)  A UPN or ProxyAddress with either a space character or an invisible character will cause the same issue.

To troubleshoot an invalid character in the UPN/ProxyAddress you must pay attention to the value stored in local AD. Don't rely on what the customer says and just ask for an LDIFDE or Get-ADobject export and inspect the values more carefully by yourself. An easy trick that always worked for me is to take the exported file (or the Shadow attribute from DSexplorer or ASC) and copy/paste the value into a PowerShell window - you will immediately see the invisible character replaced by '?' or by a square character.

![image-20200825161916888](.attachments/AAD-Synchronization/376714/image-20200825161916888.png)

<br />

### 6. InvalidSoftMatch error or soft-match not working due to BlockSoftMatch feature

The following soft-match scenarios will fail if BlockSoftMatch feature is enabled on the tenant:

* For users, when you have a cloud-only object in Azure AD, meaning its ImmutableId and DirSyncEnabled attributes are null (null is non-existent, not true nor false nor any value), and you synchronize a new object from on-premises AD with the same UPN or ProxyAddress, a soft-match occurs which merges the incoming user from on-premises AD with the existent cloud-only user in Azure AD, which becomes a connected object with DirSyncEnabled=True and an ImmutableID value stamped. When BlockSoftMatch is enabled, soft-match is not allowed and a new object will be created with a DirSyncProvisioningError (QuarantinedAttributeValueMustBeUnique in Connect Health) to flag a UserPrincipalName/ProxyAddress conflict.

* For hybrid join devices, when the user registers a device in Azure AD, the Device Registration Service (DRS) creates a cloud-mastered device in Azure AD. If later that user's computer object is synchronized from on-premises AD to Azure AD, a soft-match occurs which merges the incoming computer object with the existent cloud-mastered device in Azure AD, which becomes a connected object with DirSyncEnabled=True and an ImmutableID value stamped. When BlockSoftMatch is enabled, soft-match is not allowed and Azure AD Connect's Export step will throw an InvalidSoftMatch error.

  This is a bug being tracked here: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/1888454

  Workaround: In order to workaround this issue you have to disable BlockSoftMatch feature with `Set-MsolDirSyncFeature -Feature BlockSoftMatch -Enable $False` and, if applicable, remove the duplicated object from Azure AD (including Azure AD Recycle Bin) and try to sync the object again. For more information on how disable or enable the feature use this public article [Sync service features: Configure BlockSoftMatch
](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-syncservice-features#blocksoftmatch)


### 7. InvalidHardMatch error or hard-match not working due to feature BlockCloudObjectTakeoverThroughHardMatch

An InvalidHardMatch error occurs when theres an attempt to hard match objects present in Microsoft Entra ID with a new object being added or updated during synchronization which have the same source anchor value, but BlockCloudObjectTakeoverThroughHardMatchEnabled feature is enabled on the tenant. This feature will cause that any attempt to hard-match an on-premises AD object with an existent object in Entra ID fails.

 See the expected behavior of hard-matching objects for the following scenarios:


**Regular HardMatch (working scenario)**

When this feature **is not enabled (BlockCloudObjectTakeoverThroughHardMatch=False)** and an object is synced for which an object with a matching source anchor already exists in Entra ID and, then the default behavior would be to hard match the incoming on-premises AD object with the existent cloud object and set the DirSyncEnabled flag to "True".

**Invalid HardMatch (non-working scenario)**

When this feature **is enabled (BlockCloudObjectTakeoverThroughHardMatch=True)**, an export error is thrown with the following message: 

```
Error Code: InvalidHardMatch
Error Message: Another cloud created object with the same source anchor already exists in Azure Active Directory.
```

  ![image.png](/.attachments/image-57af006e-5750-4d64-b6f1-df57810599e1.png)

**NOTE:** The "Detail..." button contains important information about the _ObjectInConflict_ which will determine what is the existent cloud object which is trying to hard-match to.


**Most common Customer scenario (but not limited to this one):**

An UserA was previously synced to Entra ID but got removed from sync scope for some reason. On the following sync cycle, the sync engine exports a delete for this object and the userA gets soft-deleted which updates the attribute DirSyncEnabled to False (DirSyncEnabled=False state only occurs when the user is excluded from sync scope and Entra Connect Sync exports a delete to Entra ID).

Then, the Admin places the on-premises UserA back in sync scope and tries to re-sync the object. Since the cloud object is now DirSyncEnabled=False and the BlockCloudObjectTakeoverThroughHardMatch feature is enabled, the DirSync Webservice API (aka. AWS) cannot proceed with the hard-match based on the same source anchor, and **so the account enters in conflict with itself** (in this case there is no second account or incoming conflicting object).

**IMPORTANT NOTE:** Always check if there is no secondary account causing the conflict, if the feature is not enabled and you have an invalidHardMatch error follow regular troubleshooting steps


**How to check BlockCloudObjectTakeoverThroughHardMatch feature in ASC**
- ASC --> Entra Connect Settings --> Sync Properties and Features

  ![image.png](/.attachments/image-b8b2f661-d055-4c66-aa67-1e4cc7eaa95b.png)

**Solution** 


To fix the InvalidHardMatch export error, customer will have to disable _BlockCloudObjectTakeoverThroughHardMatch_ feature (see how to below), run a sync cycle which will retry the sync operation. Then, is desired, Customer can re-enable _BlockCloudObjectTakeoverThroughHardMatch_ after resolving the hard-match for the user(s).

For security reasons,we advise customers to enable BlockCloudObjectTakeoverThroughHardMatchEnabled unless they need it to take over existent accounts in Microsoft Entra ID. 

If you need to clear an InvalidHardtMatch error and match the account successfully, you can enable disable the feature and enable hard match again.


**How to disable BlockCloudObjectTakeoverThroughHardMatch feature via MS Graph PowerShell SDK**


```
# Retrieve Directory Synchronization settings and display ID and features
(Get-MgDirectoryOnPremiseSynchronization).Id, (Get-MgDirectoryOnPremiseSynchronization).Features | Format-List 

# Update the Directory Synchronization settings to disable BlockCloudObjectTakeoverThroughHardMatch
Update-MgDirectoryOnPremiseSynchronization -OnPremisesDirectorySynchronizationId <YourDirectorySynchronizationId> -Feature @{ "BlockCloudObjectTakeoverThroughHardMatchEnabled" = $false }  
```

**Note:** The old method used [Set-MsolDirSyncFeature](https://learn.microsoft.com/en-us/powershell/module/msonline/set-msoldirsyncfeature?view=azureadps-1.0), however this module will be deprecated soon, please don't recommend this to the customer.

### 8. All users objects from local connector space are marked for Deletion if "Person" was selected as source ObjectType on a synchronization rule

The "Person" object type is a Metaverse schema object type to represent AD object types such as "User", "Contact" and "InetOrgPerson". It is not intended to be used as an object type in the AD CS. 

Once an object type is added to the connector configuration, it must be manually removed. Otherwise, after running a full import on local connector, all the users in AD connector space will be marked for deletion, and those deletions will be synchronized to Entra ID

 Accidental delete threshold could be reached if users are more than 500.


There are two ways the customer could have made to include this object type in their AD connector configuration:
 

**1. Adding the object type manually in the connector configuration through the Sync Service Manager.**

This would require opening the connector properties in sync service manager, selecting "Select Object Types", select the option box "Show All" and scrolll to find the object type "Person" and select it.

This is not supported. In fact, apart from documented changes that require being done through the sync service manager like enabling synchronization of "UserType", no changes done through the old sync UI are supported.

If a change is attempted through the sync service manager, the user is warned that the Wizard should be used to make supported changes.

![error for adding person object](/.attachments/AAD-Synchronization/376714/image.png)


**2. Creating a custom rule that calls "Person" as the connect system object type or includes "Person" in one of its filters.**

When a rule is created and an object type that isn't part of the the connected system included as the connect system object type or as one of the object types to use in its filters, the object type gets automatically included in the connector configuration. -> It's most likely this is what the customer did.

Example:

 

Create a rule

![creating sync rule with person object type](/.attachments/AAD-Synchronization/376714/image-1.png)
 


The object type gets immediately added to the connector config. 

 
![person object type in connector space](/.attachments/AAD-Synchronization/376714/image-2.png)

 
**Resolution**

1. Open Synchronization Service Manager.
2. Navigate to Connectors and select the on-premises connector.
3. Click Properties.
4. Go to Select Object Types.
5. Uncheck Person.
6. Click OK to save the changes.
7. Run a Full Import to refresh the connector space.


 
<br />


## Tools

- ASC
- [profilePhoto](https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http)
- LDIFDE or;
- Get-ADUser -Identity \<username\>  -Property * \| Select * \| Export-Clixml userAD.clixml
- DSExplorer (requires a SAW machine)
- ADSyncTools: `ConvertFrom-ADSyncToolsAadDistinguishedName`, `ConvertFrom-ADSyncToolsImmutableID`, `ConvertTo-ADSyncToolsAadDistinguishedName`, `ConvertTo-ADSyncToolsCloudAnchor`, `ConvertTo-ADSyncToolsImmutableID`

 
<br />



# Data Collection Examples

## General action plan for object sync issues

### Export Configuration
Run Entra Connect Wizard \> Go to Tasks \| Troubleshoot \> Launch the troubleshooting tool \> ChoseEnter '3' - Collect General Diagnostics

### Export User from AD
```PowerShell
ldifde -f ADuser.txt -d "DC=Contoso,DC=Com" -p subtree -r "(sAMAccountName=<username>)"`
```

Export Group from AD
```PowerShell
ldifde -f ADgroup1.txt -d "DC=Contoso,DC=Com" -p subtree -r "(sAMAccountName=<groupname>)"
```

### Export User from Entra ID

```PowerShell
$identityProperties = 'id,AccountEnabled,AdditionalProperties,AssignedLicenses,AssignedPlans,CreatedDateTime,CreationType,DeletedDateTime,DeletionTimestamp,DirSyncEnabled,displayName,Identities,ImmutableId,LastDirSyncTime,LastPasswordChangeDateTime,LicenseDetails,mail,MailNickname,ObjectId,OnPremisesDistinguishedName,OnPremisesDomainName,OnPremisesImmutableId,OnPremisesLastSyncDateTime,OnPremisesProvisioningErrors,OnPremisesSamAccountName,OnPremisesSecurityIdentifier,OnPremisesSyncEnabled,OnPremisesUserPrincipalName,OtherMails,PasswordPolicies,PasswordProfile,ProvisionedPlans,ProvisioningErrors,ProxyAddresses,SecurityIdentifier,ServiceProvisioningErrors,ShowInAddressList,userPrincipalName,UserState,UserStateChangedOn,UserType' -split ','

$UpnOrId = '<type the UPN or ID>'

Get-EntraUser -UserId $UpnOrId -Property $identityProperties | select $identityProperties | Export-Clixml .\EntraUser.clixml -Depth 100
# or
Get-MgUser -UserId $UpnOrId -Property $identityProperties | select $identityProperties | Export-Clixml .\GraphUser.clixml -Depth 100
```

### Export data from Entra Connectdatabase

This tool exports all the respective objects in AADC database - AD CS, AAD CS and Metaverse using the native cmdlets Get-ADSyncMVObject/Get-ADSyncCSObject
Just provide one DistinguishedName of the object in the Connector Space (AD/AAD) as the input and the script will find the respective MV object and all connected CS objects. The result will be 2 XML files per each CS/MV objects, so typically 6 files: AD_CS, AD_CS-Serialized, MV, MV-Serialized, AAD_CS, AAD_CS-Serialized.

How to use:

i. Install ADSyncTools module (use Update-Module in case the module is already installed)

```PowerShell
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
Install-Module ADSyncTools
```

ii. Run the script from a new clean folder as this action will generate a few XML files that youll we need to ZIP and transfer to our shared workspace.

```PowerShell
Export-ADSyncToolsObjects -DistinguishedName 'CN=TestUser,OU=Sync,DC=Domain,DC=Contoso,DC=com' -ConnectorName 'Domain.Contoso.com' -ExportSerialized
```

For more information, type:

```PowerShell
Get-Help Export-ADSyncToolsObjects -Full
```

See [Azure AD Connect: ADSyncTools PowerShell Reference | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-adsynctools#export-adsynctoolsobjects)

More Examples:

Please run the script from a new clean folder as this action will generate a few XML files that youll we need to ZIP and transfer to our shared workspace.

```PowerShell
Export-ADSyncToolsObjects -ObjectId '{46EBDE97-7220-E911-80CB-000D3A3614C0}' -Source Metaverse -ExportSerialized -Verbose
Export-ADSyncToolsObjects -DistinguishedName 'CN={2B4B574735713744676B53504C39424D4C72785247513D3D}' -ConnectorName 'Contoso.onmicrosoft.com - AAD' -ExportSerialized
```

Note: In case you get into any trouble while running the cmdlet, please start a transcript (Start-Transcript / Stop-Transcript) and use the verbose parameter after the command line: -Verbose

## Run History

Use the exported CSV data in Excel to filter run profiles, calculate time span, averages, object Add/Deleted/Updates counts, highlight outliers, find patterns, etc.

```PowerShell
Export-ADSyncToolsRunHistory -TargetName "$((Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmssZ'))_RunHistory"
```

## Single Object Sync

```PowerShell
# Parameters
[string] $usrDN = "CN=user01,OU=Sync,DC=Domain,DC=Contoso,DC=com"

# Run Single-Object-Sync
Import-module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSyncDiagnostics\ADSyncDiagnostics.psm1"
[string] $output = ".\$($env:computername)\output"
md $env:computername -Force | Out-Null
Invoke-ADSyncSingleObjectSync -DistinguishedName $usrDN | Out-File -FilePath "$($output).json"
(Get-Date).ToUniversalTime() | Out-File "$($output).txt"
$htmlReport = Get-ChildItem -Path C:\ProgramData\AADConnect\ADSyncObjectDiagnostics | sort LastWriteTime | select -Last 1
Copy-Item $htmlReport.FullName ".\$env:computername"
```

## AD Replication Metadata
```
Repadmin /showobjmeta
```
> From <[http://technet.microsoft.com/de-de/library/cc742104(v=ws.10).aspx](http://technet.microsoft.com/de-de/library/cc742104(v=ws.10).aspx)>

1.  Export anobject dump:

```
ldifde -f ldifde_export.txt -d "DC=contoso,DC=com" -p subtree -r (sAMAccountName=username)

```
> Replace 'username' with the samAccountName of the target object

2.  Exportobject metadata from all Domain Controllers for a particular object:

```
repadmin /showobjmeta * "CN=name,OU=Sync,DC=contoso,DC=com" > username-ObjMeta.txt
```
> Replace the DN of the target object

3. Export theattribute readable value from all Domain Controllers for that particular user

```
repadmin /showattr * dc=Contoso,dc=com /subtree /filter:"sAMAccountName=username" /attrs:pwdLastSet >username-AttrMeta.txt
```
> Replace username and pwdLastSet with the attribute name you're troubleshooting


4.  Export the attribute raw value from a Domain Controller for that particular user

```
ldifde -f LLTS_export.txt -d "DC=contoso,DC=com" -p subtree -r (sAMAccountName=test_user) -l lastLogontimeStamp
```
> Where DC=contoso ,DC=com is the name of your domain and test_user is the particular user







