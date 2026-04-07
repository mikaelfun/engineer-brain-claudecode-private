---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Features/Group Writeback/Group Writeback settings and configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FFeatures%2FGroup%20Writeback%2FGroup%20Writeback%20settings%20and%20configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
- cw.AAD-Group
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Synchronization](/Tags/AAD%2DSynchronization) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Connect](/Tags/AAD%2DConnect) [AAD-Group](/Tags/AAD%2DGroup)                       


[[_TOC_]]


# Compliance note
This wiki contains test and/or lab data only.

# Introduction

This document  in intended to provide deep understanding of Group Writeback and how to configure it in a customer's environment. It details how to verify settings and configure different aspects of Group Writeback in two main scenarios: Green field deployment and Brown field deployment.

A training session recording, covering this subject is available [here](https://microsofteur-my.sharepoint.com/:v:/g/personal/riantu_microsoft_com/EXsfy_bFChZEk0cYofvuivkBhh_55J57usQ65LICYOkPIQ?e=dpwXUK).

<br>

# Group Writeback overview

There are two versions of group writeback. Their main characteristics are:

Group Writeback V1:

* The original version or Group Writeback V1 is limited to writing back Unified Groups (aka Microsoft 365 Groups) to on-premises Active Directory as distribution groups.
* In Azure AD Connect V2.0.88.0 or higher, the Azure AD group display name can be written back to the groups distinguished name in Active Directory, so that the group name is displayed in AD instead of the group's CloudAnchor (group_ObjectID), which was the default in older versions.

Group Writeback V2:

**Important!**

Group Writeback V2 in Entra ID Connect will no longer be supported after June 30, 2024. This is a feature that is currently in public preview that we are discontinuing. The feature will continue to work but no new fixes or updates will be released for Group Writeback V2. Customers are encouraged to switch to Cloud Sync. This information has been updated in our public documentation [Enable Microsoft Entra Connect group writeback](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-group-writeback-enable) 

The following functions will continue to work after June 30, 2024, but are no longer supported. If a customer is experiencing an issue with one of the following functions, the recommendation is to move to Cloud Sync, and engineers should assist the customer with migrating to Cloud Sync.  

* All Groups are written with a scope of Universal.
* Group nesting in Azure AD will be written back if both groups exist in Active Directory.
* Written-back groups nested as members of on-premises Active Directory synced groups will be synced up to Azure AD as nested.
* Devices that are members of writeback-enabled groups in Azure AD are also kept as members in Active Directory. Azure AD-registered and Azure AD-joined devices require device writeback to be enabled for group membership to be written back.

<br>

# Case handling

This feature is supported by the [Provisioning](mailto:azidcomm-prov@microsoft.com) community.

If a customer is experiencing an issue with a function that is part of Group Writeback V2, the recommendation is to move to Cloud Sync, and engineers should assist the customer with migrating to Cloud Sync. 

**Important!**

**Engineers should not instruct the customer to turn off Group Writeback V2 until after the customer has moved to Cloud Sync. Group Writeback V2 cannot be re-enabled after it has been disabled!!! This is not being publicly announced!!!**

<br>

# Licensing

Group Writeback V2 requires an Azure AD P1 or P2 license.

<br>

# Pre-requisites

* Azure AD Connect version 2.0.88.0 release or later.
* Optional: On-Prem Exchange Server 2016 CU15 or later. This is only needed for configuring cloud groups with exchange hybrid. See [Configure Microsoft 365 Groups with on-premises Exchange hybrid](https://docs.microsoft.com/exchange/hybrid-deployment/set-up-microsoft-365-groups#prerequisites) for more information.

<br>

# Limitations and known issues

* Group writebackdoesnot support writeback of nested group members withscope Domain localsinceAzure AD security groupsare written back with scope Universal.If you have a nested group like this, youll see an export error in Azure AD Connect with the message A universal group cannot have a local group as a memberand the resolution is it remove the member with scope Domain local from the Azure AD group.
* Group writeback only supports writing back groups to a single Organization Unit (OU).Once the feature is enabled, you cannot change the OU you selected. A workaround for this is to disable group writeback entirely in Azure AD Connect and then select a different OU when you re-enable the feature.
* Group writeback settingto manage new group writeback at scaleis not yet available. You will need to configure writeback for specific groups.
* Group Writeback V2 is still in the deployment process on sovereign clouds. The ETA for availability in these instances is the end of October 2022.

<br>

## Other notes to consider

* Dynamic groups are in scope for group writeback public preview
* Owner attribute is out of scope for group writeback public preview
* Columns in the Azure Admin portal will be there for all customers, whether they have writeback enabled or not. Might be resolved with GA
* Configuring group writeback is not supported in the Microsoft 365 Admin Center
* Exchange cloud groups are not in scope for group writeback
* Group writeback will not writeback groups that have group memberships over 250K users
* Changes made in AD to groups that are written back from AAD to AD will be overwritten on the next sync cycle

<br>

# Verify if Group Writeback V1 is enabled

To verify if Group Writeback V1 is enabled, we can use:

* _Azure Support Center_

  ![Azure Support Center](.attachments\AAD-Synchronization\883506\GWBV1_ASC.jpg)

* _DSExplorer (Only accessible with a SAW machine)_

  ![DSExplorer](.attachments\AAD-Synchronization\883506\GWBV1_DSExplorer.jpg)

* _ADSync PowerShell module (whilst working with the customer in their environment)_

  ![ADSync PowerShell](.attachments\AAD-Synchronization\883506\GWBV1_PoSh.jpg)
  
  ```powershell
  Get-ADSyncAADCompanyFeature
  ```

<br>

# Verify if Group Writeback V2 is enabled

To verify if Group Writeback V2 is enabled, we can use:

> Note: Group Writeback V2 status is not available on ASC yet.

* _DSExplorer (Only accessible with a SAW machine)_

  ![DSExplorer](.attachments\AAD-Synchronization\883506\GWBV2_DSExplorer.jpg)

* _ADSync PowerShell module (whilst working with the customer in their environment)_

  ![ADSync PowerShell](.attachments\AAD-Synchronization\883506\GWBV2_PoSh.jpg)

<br>

# Configuration

It's important to understand the customer's current configuration status before putting together an action plan to enable Group Writeback and achieve the output that the customer is looking for.
We divide the configuration scenarios into the following two main categories:

## Green field deployment

A green field deployment is a new group writeback deployment in a tenant where no group writeback has been configured before.
When working with a customer that is looking to enable Group Writeback for the first time, we need to understand the following customer's requirements:

* Should only selected Microsoft 365 Groups be written back to Active Directory, or all Microsoft 365 Groups?
* Should newly created Microsoft 365 Groups be automatically written back to Active Directory, or only if selected by the customer after the group has been created?

### Configuration order

The original version or group writeback (V1) ignores the object property IsWritebackEnabled so even if you have already disabled writeback for all M365 groups, once you select Group Writeback feature in AADConnect and finish the configuration wizard, a full sync cycle starts immediately, which will result in all Unified Groups getting written back to on-premises AD. 

To avoid this, we need to disable writeback for the existing groups that shouldnt be written back (which sets IsWritebackEnabled = False) and must enable group writeback V2 in Azure AD before enabling Group Writeback feature in AADConnect, so that the groups property IsWritebackEnabled can be honored. This way, since V2 is already enabled during first group writeback synchronization, the groups with IsWritebackEnabled = False will not be written back.

Finally, you can also update the Group.Unified directory setting to IsWritebackEnabled = False for new groups created in Azure AD, which will prevent new objects from being written back to AD by default, until the Admin explicitly sets this new group with IsWritebackEnabled = True.

![Configuration Order](.attachments\AAD-Synchronization\883506\ConfigOrder.jpg)

What is the behavior based on the group property IsWritebackEnabled?
<br>
By default, and if the Group.Unified directory setting is not configured to disable automatic write back of newly created M365 groups, when a new Unified Group is created, the property IsWritebackEnabled is not set on the object.
Property not set is the same as the property having a value of null.
Group Writeback V2 evaluates the value of this property on each Unified Group to determine whether the object is a writeback candidate or not. The object is only considered not a writeback candidate when the property has a value of false. So, when the property is not set, values = null, the feature will consider the object as a candidate for writeback.

* Default Unified Group object properties created when no Group.Unified directory setting is configured (DSExplorer):

  ![Unified Group Default](.attachments\AAD-Synchronization\883506\UGDefaultProps.jpg)

Azure Portal can be misleading since the default setting on the Writeback enabled switch is No for all groups. So, the user is led to believe that the groups will not be written back which isnt true.
To set the property IsWritebackEnabled to false, preventing the group to be written back to AD, the user needs to flip Writeback enabled to Yes which will set the property IsWritebackEnabled  with a value of true and then back to No, which will change the IsWritebackEnabled value to false.
Doing this individually for each existing unified group in Azure Portal is probably very cumbersome, so alternatively customers can set the IsWritebackEnabled property for all unified groups using a PowerShell script provided in the public documentation to [Modify Azure AD Connect group writeback default behavior](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-modify-group-writeback#disable-writeback-for-all-existing-microsoft-365-group).

* Portal Groups UI

  ![Portal UI](.attachments\AAD-Synchronization\883506\PortalUI1.jpg)

  <mark>**Note**: To view the Writeback enabled and Security enabled columns in this image, you need to select Manage View and then Edit columns and add those to your view. These are not shown by default.</mark>

* Unified Group object properties after setting IsWritebackEnabled to false (Screenshot from DSExplorer):

  ![Unified Group Modified](.attachments\AAD-Synchronization\883506\UGMod.jpg)

### Disable writeback for all existing groups

In the group writeback [public documentation](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-modify-group-writeback#disable-writeback-for-all-existing-microsoft-365-group) we provide customers with a PowerShell script to disable writeback on all existing unified groups present in the AAD directory.
This will essentially set the property IsWritebackEnabled  with a value of false for all existing unified group objects.

```powershell
#Import-module
Import-Module Microsoft.Graph.Beta

#Connect to MgGraph with necessary scope
Connect-MgGraph -Scopes Group.ReadWrite.All

#List all Microsoft 365 Groups
$Groups = Get-MgBetaGroup -All | Where-Object {$_.GroupTypes -like "*unified*"}

#Disable Microsoft 365 Groups
Foreach ($group in $Groups) 
{
  Update-MgBetaGroup -GroupId $group.id -WritebackConfiguration @{isEnabled=$false}
} 
```

This script was built to use Microsoft Graph Beta SDK for PowerShell which requires PowerShell 7. PowerShell 7 is installed side-by-side with the existing PowerShell version. It's not recommended to use this SDK with older PowerShell versions, such as 5.1, as it requires a few dependent components in PowerShell to work correctly. 

### Enable Group Writeback V2

**Important!**

**Customers are no longer able to enable Group Writeback V2.** The Set-ADSyncAADCompanyFeature -GroupWritebackV2 attribute can no longer be changed from false to true. **This is now by design.** Engineers should assist customers with moving to Cloud Sync, and **should not disable Group Writeback V2** until after customers have moved to Cloud Sync, since it cannot be reenabled. **This is not being publicly announced**


### Enable Unified Group Writeback (Group Writeback V1)

The next step is to enable group writeback in AADConnect.

1. Start the configuration wizard and go through all sections without making any changes, until the Optional Features wizard page.
2. Check the Group writeback checkbox and click Next

  ![AADC_UnifiedGWB1](.attachments\AAD-Synchronization\883506\AADC_UnifiedGWB1.jpg)

3. Select the writeback forest and then the group writeback container
4. Check the Writeback Group Distinguished Name with cloud Display Name to use the group display name in Active Directory.

  ![AADC_UnifiedGWB2](.attachments\AAD-Synchronization\883506\AADC_UnifiedGWB2.jpg)

<mark>**Note**: This option can only be set when enabling Group Writeback. If the Group Writeback feature is already enabled, the checkbox will be greyed out.<mark>

When you select the option Writeback Group Distinguished Name with cloud Display Name a new outbound sync rule is automatically created, "Out to AD  Group SOAInAAD - DN":

![Out to AD  Group SOAInAAD - DN1](.attachments\AAD-Synchronization\883506\GWB_Rule1.jpg)
![Out to AD  Group SOAInAAD - DN2](.attachments\AAD-Synchronization\883506\GWB_Rule2.jpg)

This rule only has one transformation with an expression to take the display name and the last 12 characters of the group cloud anchor and write it in the written back group AD objects distinguished name.

```expression
EscapeDNComponent("CN=" & Left(Trim([displayName]),51) & "_" & Right([cloudAnchor],12)) & "," & %Connector.GroupWriteBackContainerDn%
```

If you encounter an issue where a customer is getting the group objects written in AD with the group cloud anchor in the DN, you need to verify:

* What is the AADConnect version
* Whether Writeback Group Distinguished Name with cloud Display Name option is selected
* Whether the sync rules "Out to AD  Group SOAInAAD - DN" is present in the object's lineage

### Disable automatic writeback of newly created unified groups

The last action is disabling automatic writeback of new unified groups.
This will guarantee that when a new unified group is created, it doesn't get automatically written back to AD. To do that, well need to either create or update the "Group.Unified" directory setting which essentially adds the property IsWritebackEnabled = False on all new unified groups created. This can be done with a PowerShell script (based on Microsoft Graph SDK) included in the group writeback [public documentation](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-modify-group-writeback#disable-automatic-writeback-of-new-microsoft-365-groups).

```powershell
# Import Module
Import-Module Microsoft.Graph.Beta.Identity.DirectoryManagement

#Connect to MgGraph with necessary scope
Connect-MgGraph -Scopes Directory.ReadWrite.All


# Verify if "Group.Unified" directory settings exist
$DirectorySetting = Get-MgBetaDirectorySetting| Where-Object {$_.DisplayName -eq "Group.Unified"}

# If "Group.Unified" directory settings exist, update the value for new unified group writeback default
if ($DirectorySetting) 
{
  $params = @{
    Values = @(
      @{
        Name = "NewUnifiedGroupWritebackDefault"
        Value = $false
      }
    )
  }
  Update-MgBetaDirectorySetting -DirectorySettingId $DirectorySetting.Id -BodyParameter $params
}
else
{
  # In case the directory setting doesn't exist, create a new "Group.Unified" directory setting
  # Import "Group.Unified" template values to a hashtable
  $Template = Get-MgBetaDirectorySettingTemplate | Where-Object {$_.DisplayName -eq "Group.Unified"}
  $TemplateValues = @{}
  $Template.Values | ForEach-Object {
      $TemplateValues.Add($_.Name, $_.DefaultValue)
  }

  # Update the value for new unified group writeback default
  $TemplateValues["NewUnifiedGroupWritebackDefault"] = $false

  # Create a directory setting using the Template values hashtable including the updated value
  $params = @{}
  $params.Add("TemplateId", $Template.Id)
  $params.Add("Values", @())
  $TemplateValues.Keys | ForEach-Object {
      $params.Values += @(@{Name = $_; Value = $TemplateValues[$_]})
  }
  New-MgBetaDirectorySetting -BodyParameter $params
}
```

This script will first verify if a directory setting for unified groups already exists. If it does, update the property NewUnifiedGroupWritebackDefault with a value of false.
If it doesnt itll create a new directory setting based on the default Unified Group directory template with an updated value of false to the property NewUnifiedGroupWritebackDefault.

### Green field deployment decision diagram

![Green field deployment](.attachments\AAD-Synchronization\883506\GreenFieldDeployment.jpg)

## Brown field deployment

A brown field deployment is considered when, for example, enabling Group Writeback V2 ina tenant where Unified Group Writeback (Group Writeback V1) is or has been already enabled.

Lets assume a scenario where, unified group writeback was already enabled in AADConnect and now customer enabled group writeback V2, but:

1. Is not being able to get rid of undesired unified groups written back to on-premises AD. Customer deletes the groups in AD, but they are written back again on the next sync cycle.
2. Newly created unified groups are getting written back to AD on the AADConnect sync cycle that runs after the group is created in AAD, even though, in the Azure portal, the writeback enabled option is set to No for these groups.
3. The desired outcome is to remove all groups written back from on-premises AD, and then writeback only selected groups.

As with any support case, when you get a case about writeback, its important to scope what is the desired results, what is the current behavior and understand the deviation to define a proper set of actions.
When working with a customer that is looking to configure group writeback on a tenant where some version of group writeback is, or has already been, enabled we need to have answers to the following scoping questions:

1. What is the desired end behavior regarding group writeback?
2. Is group writeback V2 enabled?
3. Is unified group writeback (Group writeback V1) enabled in AADConnect?
4. Are unified groups already written back to AD?
5. Does the customer want to remove from Active Directory some of the groups already written back?
6. What is the current default writeback behavior for newly created unified groups?

By asking these scoping questions and understanding the deviance, we can start verifying the current status of the feature configurations and adjust them to achieve the desired needs.

In this document we've already seen how to verify:

* if group [writeback V1](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/883506/Group-Writeback-settings-and-configuration?anchor=verify-if-group-writeback-v1-is-enabled) and/or group [writeback V2](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/883506/Group-Writeback-settings-and-configuration?anchor=verify-if-group-writeback-v2-is-enabled) are enabled.
* How to [verify IsWritebackEnabled property value](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/883506/Group-Writeback-settings-and-configuration?anchor=configuration-order) to determine whether an object is a writeback candidate deterministically true or by omission null.
* [How to disable writeback for all existing unified groups](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/883506/Group-Writeback-settings-and-configuration?anchor=disable-writeback-for-all-existing-groups).
* [And how to disable writeback for newly created unified groups](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/883506/Group-Writeback-settings-and-configuration?anchor=disable-automatic-writeback-of-newly-created-unified-groups).

But we haven't covered how to verify if the directory setting to disable writeback of newly created unified groups is already created and has the desired values, nor how to permanently delete groups that have already been written back to on-premises Active Directory and have been exclude from writeback candidacy. These two topics will be covered in the next couple of sections.

### Verify if a directory setting for unified groups already exists

As explained, the script provided to customers in our public documentation will first verify if the directory setting already exists.
However, you may want to confirm beforehand. For example, when you get a support case about group writeback. You can verify which settings are already configured and hit the ground running with all information in hand.

You can use ASCs Graph Explorer feature. Run this simple query /groupSettings which will query all directory settings configured in the directory. If no data is found, none is configured.

![DirectorySetting_ASC](.attachments\AAD-Synchronization\883506\DirectorySetting_ASC.jpg)

You can also use DSExplorer on a SAW machine  If you dont have a SAW machine, you can reach out to your assigned TA or PTA to verify this property for you  search the tenant and in the directory context, look for the property ObjectSettings. If the property does not exist in the directory context, that means theres no directory setting configured.
If the property ObjectSettings exists in the directory context but has no settings values, that means a directory setting has already existed, but was deleted.
Note that ObjectSettings holds directory settings. It is not exclusive to the settings for unified groups we are covering in this article, so you may find settings here that are specific to other object types. Analyze carefully.

![DirectorySetting_DSExplorer](.attachments\AAD-Synchronization\883506\DirectorySetting_DSExplorer.jpg)

Another option, is doing it with the customer, using the MS Graph SDK for PowerShell with the commands shown here:

```powershell
Import-Module Microsoft.Graph.Beta.Identity.DirectoryManagement
Connect-MgGraph -Scopes Directory.ReadWrite.All
Get-MgBetaDirectorySetting | Where-Object {$_.DisplayName -eq "Group.Unified"} | Select-Object -ExpandProperty Values
```

Example output:

![DirectorySetting_PowerShell](.attachments\AAD-Synchronization\883506\DirectorySetting_PowerShell.jpg)

If theres a directory setting configured for unified groups, youll find results such as in these examples. If theres no directory setting configured, youll get no results.
We want to look for the directory setting property NewUnifiedGroupWritebackDefault value.

* false means new Unified Group objects will not be writeback candidates by default. Customers will need to select individually which groups should be written back.
* true means new Unified Group objects will be writeback candidates by default and will be provisioned to on-premises active directory on the next AADConnect sync cycle.

### Permanently delete Active Directory written back groups excluded from writeback

By design, groups that have already been written back or staged in AADConnect to writeback, will be written back again to Active Directory after being manually deleted there.
In other words, even if you exclude the group from writeback, manually delete the written back group in Active Directory, on the next sync cycle, AADConnect will provision that group again in Active Directory.
To permanently delete groups excluded from group writeback, in Active Directory, youll need to create a new inbound rule for the Azure AD connector.

This rule will evaluate whether the group is in scope for writeback, and whether the group is soft-deleted or permanently deleted in Azure AD. This will apply to all group types. Unified groups and Security groups.
A script to create this rule is available in our [public documentation](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-modify-group-writeback#delete-groups-when-theyre-disabled-for-writeback-or-soft-deleted).

```powershell
Import-Module ADSync
# Enter a unique sync rule precedence value [0-99]
$precedenceValue = 50

# BEGIN
New-ADSyncRule  `
-Name 'In from AAD - Group SOAinAAD Delete WriteBackOutOfScope and SoftDelete' `
-Identifier 'cb871f2d-0f01-4c32-a333-ff809145b947' `
-Description 'Delete AD groups that fall out of scope of Group Writeback or get Soft Deleted in Azure AD' `
-Direction 'Inbound' `
-Precedence $precedenceValue `
-PrecedenceAfter '00000000-0000-0000-0000-000000000000' `
-PrecedenceBefore '00000000-0000-0000-0000-000000000000' `
-SourceObjectType 'group' `
-TargetObjectType 'group' `
-Connector 'b891884f-051e-4a83-95af-2544101c9083' `
-LinkType 'Join' `
-SoftDeleteExpiryInterval 0 `
-ImmutableTag '' `
-OutVariable syncRule

Add-ADSyncAttributeFlowMapping  `
-SynchronizationRule $syncRule[0] `
-Destination 'reasonFiltered' `
-FlowType 'Expression' `
-ValueMergeType 'Update' `
-Expression 'IIF((IsPresent([reasonFiltered]) = True) && (InStr([reasonFiltered], "WriteBackOutOfScope") > 0 || InStr([reasonFiltered], "SoftDelete") > 0), "DeleteThisGroupInAD", [reasonFiltered])' `
 -OutVariable syncRule

New-Object  `
-TypeName 'Microsoft.IdentityManagement.PowerShell.ObjectModel.ScopeCondition' `
-ArgumentList 'cloudMastered','true','EQUAL' `
-OutVariable condition0

Add-ADSyncScopeConditionGroup  `
-SynchronizationRule $syncRule[0] `
-ScopeConditions @($condition0[0]) `
-OutVariable syncRule

New-Object  `
-TypeName 'Microsoft.IdentityManagement.PowerShell.ObjectModel.JoinCondition' `
-ArgumentList 'cloudAnchor','cloudAnchor',$false `
-OutVariable condition0

Add-ADSyncJoinConditionGroup  `
-SynchronizationRule $syncRule[0] `
-JoinConditions @($condition0[0]) `
-OutVariable syncRule

$newSyncRule = Add-ADSyncRule  `
-SynchronizationRule $syncRule[0]

If ($newSyncRule) {
    $newSyncRule | Select-Object Identifier, Name, Direction, Precedence
    Write-Host "Sync rule created successfully." -ForegroundColor Green
}

```

### Brown field deployment decision diagram

![BrownFieldDeployment](.attachments\AAD-Synchronization\883506\BrownFieldDeployment.jpg)

# Security Groups

The UX regarding security groups writeback is very straight forward.
By default, security groups are not writeback candidates. Customers can use the Azure Portal UI to individually select which security groups should be written back to Active Directory, flipping the Writeback enabled switch to Yes.
Remember that, to view the columns Security enabled, Target writeback type and Writeback enabled, you need to add them to the view through the Manage view -> Edit columns option.

![SecurityGroups_Writeback](.attachments\AAD-Synchronization\883506\SecurityGroups_Writeback.jpg)

# Training

## Deep Dive: 24376 - Azure AD Connect Group Writeback

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.
3. Launch the [Deep Dive: 24376 - Azure AD Connect Group Writeback](https://aka.ms/AAh46qi) course.

